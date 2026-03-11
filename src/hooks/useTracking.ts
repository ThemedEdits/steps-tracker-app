/**
 * useTracking — GPS tracking hook
 *
 * ROOT CAUSE OF OLD BUGS:
 *
 * 1. STALE CLOSURE — startGPS was a useCallback that closed over `session`
 *    from render time. Every GPS position callback was reading the OLD session
 *    values (distance, elapsed, routePoints) frozen at the moment startGPS
 *    was created. Moving the phone in the air triggered a GPS accuracy change
 *    which caused the component to re-render and accidentally recreate startGPS
 *    with fresh state — that's why it "worked" when you moved the phone up.
 *    FIX: All mutable tracking state is stored in refs, never in the closure.
 *
 * 2. DOUBLE GPS WATCH — every time session changed, the useEffect re-ran,
 *    calling startGPS() again and creating a new watchPosition without clearing
 *    the old one. Multiple simultaneous watches = duplicate/conflicting updates.
 *    FIX: GPS watch starts once on mount, controlled by an isActiveRef.
 *
 * 3. TOO AGGRESSIVE FILTERING — `distanceDelta > 2` as minimum threshold
 *    was silently discarding every small movement. Walking ~1m/s means you'd
 *    need to walk 2+ seconds between GPS pings before anything registered.
 *    Combined with `maximumAge: 2000` returning cached positions, real motion
 *    was swallowed. FIX: threshold lowered to 0.5m, maximumAge set to 0.
 *
 * 4. ACCURACY FILTER TOO STRICT on mobile — rejecting > 100m blocked the
 *    first few positions while GPS was warming up. FIX: Accept up to 150m,
 *    only reject truly bad readings (> 500m).
 *
 * 5. TIMER RECREATED on every state change — interval was torn down and
 *    recreated whenever session.distance or session.avgSpeed changed, causing
 *    visual jitter. FIX: Single stable interval, reads elapsed from ref.
 *
 * 6. SPREADING ROUTE POINTS into state on every GPS ping — `[...session.routePoints, newPoint]`
 *    created a new array copy on every update, causing expensive re-renders.
 *    FIX: Route points accumulate in a ref; only synced to state on stop.
 *
 * 7. PERFORMANCE — Zustand updateSession called on every single GPS event
 *    with full object spread. FIX: Batch updates, use refs for hot-path data.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import {
  calculateDistance,
  estimateSteps,
  calculateCalories,
  calculateSpeed,
  calculatePace,
  getActivityType,
} from '../utils/calculations';

export const useTracking = () => {
  const { profile, updateSession } = useAppStore();

  // ── Refs for all hot-path data (no stale closure problems) ─────────────────
  const watchIdRef        = useRef<number | null>(null);
  const timerRef          = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActiveRef       = useRef(false);
  const startTimeRef      = useRef<number>(0);
  const elapsedRef        = useRef(0);
  const distanceRef       = useRef(0);
  const maxSpeedRef       = useRef(0);
  const lastPosRef        = useRef<{ lat: number; lng: number; timestamp: number } | null>(null);
  const speedSamplesRef   = useRef<number[]>([]);
  const routePointsRef    = useRef<Array<{ lat: number; lng: number; timestamp: number; speed?: number }>>([]);

  // Keep profile in a ref so GPS callback always has current weight/height
  const profileRef = useRef(profile);
  useEffect(() => { profileRef.current = profile; }, [profile]);

  // ── Timer — single stable interval, never recreated ────────────────────────
  const startTimer = useCallback(() => {
    if (timerRef.current) return; // already running
    timerRef.current = setInterval(() => {
      if (!isActiveRef.current) return;
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      elapsedRef.current = elapsed;

      const calories = calculateCalories(
        distanceRef.current,
        elapsed,
        profileRef.current?.weight ?? 70,
        speedSamplesRef.current.length > 0
          ? speedSamplesRef.current.reduce((a, b) => a + b, 0) / speedSamplesRef.current.length
          : 0
      );

      // Only push timer-driven updates (elapsed + calories) to Zustand
      // to avoid triggering unnecessary re-renders from GPS data
      updateSession({ elapsed, calories });
    }, 1000);
  }, [updateSession]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── GPS position handler ────────────────────────────────────────────────────
  const onPosition = useCallback((pos: GeolocationPosition) => {
    if (!isActiveRef.current) return;

    const { latitude: lat, longitude: lng, accuracy, speed: gpsSpeed } = pos.coords;
    const timestamp = pos.timestamp;

    // Reject truly unusable GPS fixes (> 500m accuracy)
    // Be lenient at the start while GPS is acquiring signal
    if (accuracy > 500) return;

    const newPos = { lat, lng, timestamp };

    if (!lastPosRef.current) {
      // First position — just store it, don't calculate yet
      lastPosRef.current = newPos;
      return;
    }

    const timeDeltaMs  = timestamp - lastPosRef.current.timestamp;
    const timeDeltaSec = timeDeltaMs / 1000;

    // Skip if timestamp hasn't advanced (duplicate cached position)
    if (timeDeltaMs < 100) return;

    const distDelta = calculateDistance(
      lastPosRef.current.lat, lastPosRef.current.lng,
      lat, lng
    );

    // ── Noise filters ─────────────────────────────────────────────────────────
    // 1. Impossible speed filter: > 50 m/s (180 km/h) = GPS glitch
    const impliedSpeed = timeDeltaSec > 0 ? distDelta / timeDeltaSec : 0;
    if (impliedSpeed > 50) {
      // Don't discard position, just don't add distance — update lastPos
      lastPosRef.current = newPos;
      return;
    }

    // 2. Minimum movement threshold — 0.5m avoids GPS drift while standing still
    if (distDelta < 0.5) {
      // Still update lastPos so timestamps stay current
      lastPosRef.current = newPos;
      return;
    }

    // ── Valid movement — accumulate ───────────────────────────────────────────
    distanceRef.current += distDelta;

    // Speed: prefer GPS-native speed (hardware sensor), fall back to computed
    let instantSpeedKmh: number;
    if (gpsSpeed != null && gpsSpeed >= 0) {
      instantSpeedKmh = gpsSpeed * 3.6; // m/s → km/h
    } else {
      instantSpeedKmh = calculateSpeed(distDelta, timeDeltaSec);
    }
    // Hard cap at 50 km/h (reasonable max for running/walking)
    instantSpeedKmh = Math.min(instantSpeedKmh, 50);

    // Rolling average speed — last 8 samples (~8 GPS pings)
    speedSamplesRef.current.push(instantSpeedKmh);
    if (speedSamplesRef.current.length > 8) speedSamplesRef.current.shift();
    const avgSpeed = speedSamplesRef.current.reduce((a, b) => a + b, 0) / speedSamplesRef.current.length;

    if (instantSpeedKmh > maxSpeedRef.current) {
      maxSpeedRef.current = instantSpeedKmh;
    }

    const height  = profileRef.current?.height ?? 170;
    const steps   = estimateSteps(distanceRef.current, height);
    const pace    = calculatePace(distanceRef.current, elapsedRef.current);
    const type    = getActivityType(avgSpeed);

    // Store route point in ref (cheap), not state
    routePointsRef.current.push({ lat, lng, timestamp, speed: instantSpeedKmh });

    // Push GPS-driven metrics to Zustand
    // (elapsed/calories come from timer separately — no double-update)
    updateSession({
      distance:     distanceRef.current,
      steps,
      currentSpeed: parseFloat(instantSpeedKmh.toFixed(1)),
      avgSpeed:     parseFloat(avgSpeed.toFixed(1)),
      maxSpeed:     parseFloat(maxSpeedRef.current.toFixed(1)),
      pace,
      activityType: type,
    });

    lastPosRef.current = newPos;
  }, [updateSession]);

  // ── Start GPS watch — called once, stays alive ─────────────────────────────
  const startGPS = useCallback(() => {
    if (watchIdRef.current !== null) return; // already watching
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      onPosition,
      (err) => console.warn('GPS error:', err.code, err.message),
      {
        enableHighAccuracy: true,
        timeout:     15000,
        maximumAge:  0,       // always request fresh position, never use cache
      }
    );
  }, [onPosition]);

  const stopGPS = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    lastPosRef.current = null;
  }, []);

  // ── Public controls (called from TrackingPage) ─────────────────────────────
  const start = useCallback(() => {
    distanceRef.current    = 0;
    elapsedRef.current     = 0;
    maxSpeedRef.current    = 0;
    speedSamplesRef.current = [];
    routePointsRef.current  = [];
    lastPosRef.current      = null;
    startTimeRef.current    = Date.now();
    isActiveRef.current     = true;
    startGPS();
    startTimer();
  }, [startGPS, startTimer]);

  const pause = useCallback(() => {
    isActiveRef.current = false;
    stopTimer();
    // Keep GPS watch alive so resume is instant (no re-acquisition wait)
  }, [stopTimer]);

  const resume = useCallback(() => {
    // Offset startTime so elapsed continues from where it left off
    startTimeRef.current = Date.now() - (elapsedRef.current * 1000);
    isActiveRef.current  = true;
    startTimer();
    // GPS watch is already running
  }, [startTimer]);

  const stop = useCallback(() => {
    isActiveRef.current = false;
    stopTimer();
    stopGPS();
    // Flush accumulated route points into Zustand for the summary screen
    updateSession({ routePoints: routePointsRef.current });
  }, [stopTimer, stopGPS, updateSession]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      stopTimer();
      stopGPS();
    };
  }, [stopTimer, stopGPS]);

  return { start, pause, resume, stop };
};