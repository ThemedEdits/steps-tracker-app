// GPS tracking hook using Geolocation API
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

interface Position {
  lat: number;
  lng: number;
  timestamp: number;
  speed?: number | null;
  accuracy?: number;
}

export const useTracking = () => {
  const { session, profile, updateSession } = useAppStore();
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPositionRef = useRef<Position | null>(null);
  const speedHistoryRef = useRef<number[]>([]);

  // Update timer every second
  useEffect(() => {
    if (session.isActive && !session.isPaused) {
      timerRef.current = setInterval(() => {
        if (session.startTime) {
          const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
          
          // Recalculate calories with updated time
          const calories = calculateCalories(
            session.distance,
            elapsed,
            profile?.weight || 70,
            session.avgSpeed
          );
          
          updateSession({ elapsed, calories });
        }
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [session.isActive, session.isPaused, session.startTime, session.distance, session.avgSpeed, profile?.weight, updateSession]);

  // Start GPS tracking
  const startGPS = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPosition: Position = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: pos.timestamp,
          speed: pos.coords.speed,
          accuracy: pos.coords.accuracy,
        };

        // Only update if accuracy is acceptable (< 50m)
        if ((pos.coords.accuracy || 0) > 100) return;

        if (lastPositionRef.current && session.isActive && !session.isPaused) {
          const distanceDelta = calculateDistance(
            lastPositionRef.current.lat,
            lastPositionRef.current.lng,
            newPosition.lat,
            newPosition.lng
          );

          // Filter out GPS noise (ignore jumps > 100m in 2 seconds)
          const timeDelta = (newPosition.timestamp - lastPositionRef.current.timestamp) / 1000;
          if (distanceDelta > 100 && timeDelta < 2) {
            return;
          }

          // Only add if meaningful distance moved (> 2m)
          if (distanceDelta > 2) {
            const newDistance = session.distance + distanceDelta;
            const newSteps = estimateSteps(newDistance, profile?.height || 170);
            
            // Calculate instant speed (from GPS or computed)
            let instantSpeed = pos.coords.speed != null
              ? pos.coords.speed * 3.6 // m/s → km/h
              : (timeDelta > 0 ? calculateSpeed(distanceDelta, timeDelta) : 0);
            
            // Smooth speed: clamp to realistic bounds
            instantSpeed = Math.min(instantSpeed, 60); // max 60 km/h

            // Track speed history for average
            speedHistoryRef.current.push(instantSpeed);
            if (speedHistoryRef.current.length > 20) {
              speedHistoryRef.current.shift();
            }
            
            const avgSpeed = speedHistoryRef.current.length > 0
              ? speedHistoryRef.current.reduce((a, b) => a + b, 0) / speedHistoryRef.current.length
              : 0;

            const newMaxSpeed = Math.max(session.maxSpeed, instantSpeed);
            const newPace = calculatePace(newDistance, session.elapsed);
            const activityType = getActivityType(avgSpeed);

            const newRoutePoints = [
              ...session.routePoints,
              { lat: newPosition.lat, lng: newPosition.lng, timestamp: newPosition.timestamp, speed: instantSpeed }
            ];

            updateSession({
              distance: newDistance,
              steps: newSteps,
              currentSpeed: parseFloat(instantSpeed.toFixed(1)),
              avgSpeed: parseFloat(avgSpeed.toFixed(1)),
              maxSpeed: parseFloat(newMaxSpeed.toFixed(1)),
              pace: newPace,
              activityType,
              routePoints: newRoutePoints,
            });
          }
        }

        lastPositionRef.current = newPosition;
      },
      (error) => {
        console.error('GPS Error:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 2000,
      }
    );
  }, [session, profile, updateSession]);

  // Stop GPS tracking
  const stopGPS = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    lastPositionRef.current = null;
    speedHistoryRef.current = [];
  }, []);

  // Start/stop based on session state
  useEffect(() => {
    if (session.isActive && !session.isPaused) {
      startGPS();
    } else {
      stopGPS();
    }
    return () => stopGPS();
  }, [session.isActive, session.isPaused, startGPS, stopGPS]);

  return { session };
};
