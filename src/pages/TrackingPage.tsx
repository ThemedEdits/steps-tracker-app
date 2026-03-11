// Run/Walk Tracking page
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Square, MapPin, Zap, Footprints,
  Flame, Timer, Gauge, TrendingUp, Signal, SignalZero
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useTracking } from '../hooks/useTracking';
import { saveActivity } from '../firebase/activities';
import { Button } from '../components/ui/index';
import { formatDuration, formatDistance, formatPace } from '../utils/calculations';

type TrackState = 'idle' | 'active' | 'paused' | 'done';

// ── Speed ring ────────────────────────────────────────────────────────────────
const SpeedRing: React.FC<{ speed: number }> = ({ speed }) => {
  const max = 20;
  const pct = Math.min(speed / max, 1);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const isRunning = speed >= 7;

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        {/* Track */}
        <circle cx="60" cy="60" r={r} fill="none"
          stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
        {/* Progress */}
        <circle cx="60" cy="60" r={r} fill="none"
          stroke={isRunning ? '#f97316' : '#60a5fa'}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl text-white leading-none">
          {speed.toFixed(1)}
        </span>
        <span className="text-gray-400 text-xs font-body mt-1">km/h</span>
        <span className={`text-xs font-body font-semibold mt-1.5 ${isRunning ? 'text-brand-400' : 'text-blue-400'}`}>
          {isRunning ? '🏃 RUN' : '🚶 WALK'}
        </span>
      </div>
    </div>
  );
};

// ── Metric box ────────────────────────────────────────────────────────────────
const Metric: React.FC<{
  label: string; value: string; unit?: string;
  icon: React.ReactNode; highlight?: boolean;
}> = ({ label, value, unit, icon, highlight }) => (
  <div className={`glass rounded-2xl p-4 ${highlight ? 'border border-brand-500/25' : ''}`}>
    <div className="flex items-center gap-2 mb-2">
      <span className={highlight ? 'text-brand-400' : 'text-gray-500'}>{icon}</span>
      <span className="text-gray-400 text-xs font-body uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-end gap-1">
      <span className={`font-display text-3xl ${highlight ? 'text-brand-400' : 'text-white'}`}>
        {value}
      </span>
      {unit && <span className="text-gray-400 text-sm font-body mb-0.5">{unit}</span>}
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
export const TrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, session, startSession, pauseSession, resumeSession, resetSession, updateSession } = useAppStore();
  const tracker = useTracking();

  const [trackState, setTrackState] = useState<TrackState>('idle');
  const [gpsReady, setGpsReady]     = useState<'checking' | 'ok' | 'denied' | 'unavailable'>('checking');
  const [saving, setSaving]         = useState(false);
  const [savedId, setSavedId]       = useState<string | null>(null);

  // ── Check GPS permission on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) { setGpsReady('unavailable'); return; }
    navigator.geolocation.getCurrentPosition(
      () => setGpsReady('ok'),
      (e) => setGpsReady(e.code === e.PERMISSION_DENIED ? 'denied' : 'ok'),
      { timeout: 8000, maximumAge: 0 }
    );
  }, []);

  // ── Controls ───────────────────────────────────────────────────────────────
  const handleStart = () => {
    startSession();           // sets Zustand session.isActive
    tracker.start();          // starts GPS + timer via refs
    setTrackState('active');
    setSavedId(null);
  };

  const handlePause = () => {
    pauseSession();
    tracker.pause();
    setTrackState('paused');
  };

  const handleResume = () => {
    resumeSession();
    tracker.resume();
    setTrackState('active');
  };

  const handleStop = () => {
    pauseSession();
    tracker.stop();           // flushes routePoints into Zustand
    setTrackState('done');
  };

  const handleSave = async () => {
    if (!user || session.distance < 5) return;
    setSaving(true);
    try {
      const id = await saveActivity({
        userId:     user.uid,
        type:       session.activityType,
        distance:   session.distance,
        steps:      session.steps,
        calories:   session.calories,
        avgSpeed:   session.avgSpeed,
        maxSpeed:   session.maxSpeed,
        duration:   session.elapsed,
        pace:       session.pace,
        routePoints: session.routePoints.slice(0, 500),
      });
      setSavedId(id);
    } catch (e) {
      console.error('Save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    resetSession();
    setTrackState('idle');
    setSavedId(null);
  };

  const handleNewActivity = () => {
    resetSession();
    setTrackState('idle');
    setSavedId(null);
  };

  // ── Distance display helper ────────────────────────────────────────────────
  const distParts = formatDistance(session.distance).split(' ');

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8">

      {/* Header */}
      <div>
        <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide">
          {trackState === 'done' ? 'ACTIVITY DONE' : <>TRACK <span className="text-gradient">ACTIVITY</span></>}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          {gpsReady === 'ok'
            ? <Signal className="w-4 h-4 text-emerald-400" />
            : <SignalZero className="w-4 h-4 text-red-400" />}
          <span className={`text-xs font-body uppercase tracking-widest ${
            gpsReady === 'ok' ? 'text-emerald-400' :
            gpsReady === 'checking' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            GPS {gpsReady === 'ok' ? 'Ready' : gpsReady === 'checking' ? 'Acquiring…' :
                 gpsReady === 'denied' ? 'Permission denied' : 'Unavailable'}
          </span>
          {trackState === 'active' && (
            <>
              <span className="text-night-700">·</span>
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-brand-400 text-xs font-body uppercase tracking-widest">Recording</span>
            </>
          )}
          {trackState === 'paused' && (
            <>
              <span className="text-night-700">·</span>
              <span className="text-yellow-400 text-xs font-body uppercase tracking-widest">Paused</span>
            </>
          )}
        </div>
      </div>

      {/* ── DONE STATE — summary + save ───────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {trackState === 'done' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass rounded-3xl p-7 border border-brand-500/20"
            style={{ boxShadow: '0 0 40px rgba(249,115,22,0.08)' }}
          >
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-7 h-7 text-brand-400" />
              </div>
              <h2 className="font-display text-3xl text-white">
                {session.activityType === 'run' ? 'RUN COMPLETE' : 'WALK COMPLETE'}
              </h2>
              {session.distance < 5 && (
                <p className="text-yellow-400 font-body text-sm mt-1">Too short to save (min 5m)</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Distance',  value: formatDistance(session.distance) },
                { label: 'Duration',  value: formatDuration(session.elapsed) },
                { label: 'Avg Speed', value: `${session.avgSpeed.toFixed(1)} km/h` },
                { label: 'Max Speed', value: `${session.maxSpeed.toFixed(1)} km/h` },
                { label: 'Steps',     value: session.steps.toLocaleString() },
                { label: 'Calories',  value: `${session.calories} kcal` },
                { label: 'Pace',      value: formatPace(session.pace) },
                { label: 'GPS Points',value: session.routePoints.length.toString() },
              ].map(m => (
                <div key={m.label} className="bg-night-800/60 rounded-xl p-4">
                  <p className="text-gray-500 text-xs font-body uppercase tracking-widest mb-1">{m.label}</p>
                  <p className="text-white font-mono font-semibold">{m.value}</p>
                </div>
              ))}
            </div>

            {savedId ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                  <p className="text-emerald-400 font-body font-semibold text-sm">Saved successfully!</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => navigate(`/activity/${savedId}`)} className="flex-1 justify-center text-sm">
                    View Details
                  </Button>
                  <Button onClick={handleNewActivity} className="flex-1 justify-center text-sm">
                    New Activity
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button variant="ghost" onClick={handleDiscard} className="flex-1 justify-center">
                  Discard
                </Button>
                <Button
                  onClick={handleSave}
                  loading={saving}
                  disabled={session.distance < 5}
                  className="flex-1 justify-center"
                >
                  Save Activity
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── TRACKING STATE — live metrics ──────────────────────────────── */}
        {trackState !== 'done' && (
          <motion.div key="tracking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {/* Speed ring + timer */}
            <div className="glass rounded-3xl p-7 flex flex-col items-center mb-5">
              <SpeedRing speed={session.currentSpeed} />
              <div className="flex items-center gap-2 mt-5">
                <Timer className="w-4 h-4 text-gray-500" />
                <span className="font-mono text-4xl text-white tracking-wider">
                  {formatDuration(session.elapsed)}
                </span>
              </div>
            </div>

            {/* Metrics grid — 2×3 */}
            <div className="grid grid-cols-2 gap-3">
              <Metric
                label="Distance"
                value={distParts[0]}
                unit={distParts[1]}
                icon={<MapPin className="w-4 h-4" />}
                highlight
              />
              <Metric
                label="Avg Speed"
                value={session.avgSpeed.toFixed(1)}
                unit="km/h"
                icon={<Gauge className="w-4 h-4" />}
              />
              <Metric
                label="Steps"
                value={session.steps.toLocaleString()}
                icon={<Footprints className="w-4 h-4" />}
              />
              <Metric
                label="Calories"
                value={session.calories.toString()}
                unit="kcal"
                icon={<Flame className="w-4 h-4" />}
              />
              <Metric
                label="Pace"
                value={formatPace(session.pace).split(' ')[0]}
                unit="/km"
                icon={<TrendingUp className="w-4 h-4" />}
              />
              <Metric
                label="Max Speed"
                value={session.maxSpeed.toFixed(1)}
                unit="km/h"
                icon={<Zap className="w-4 h-4" />}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 pt-4">
              {trackState === 'idle' && (
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={handleStart}
                  className="w-24 h-24 rounded-full bg-brand-500 flex items-center justify-center relative"
                  style={{ boxShadow: '0 0 40px rgba(249,115,22,0.45)' }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-brand-400/50"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <Play className="w-9 h-9 text-white ml-1" />
                </motion.button>
              )}

              {(trackState === 'active' || trackState === 'paused') && (
                <>
                  {/* Pause / Resume */}
                  <motion.button
                    whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                    onClick={trackState === 'active' ? handlePause : handleResume}
                    className="w-16 h-16 rounded-full glass border border-night-600 hover:border-brand-500/50 flex items-center justify-center transition-colors"
                  >
                    {trackState === 'active'
                      ? <Pause className="w-6 h-6 text-white" />
                      : <Play className="w-6 h-6 text-brand-400 ml-0.5" />}
                  </motion.button>

                  {/* Stop */}
                  <motion.button
                    whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                    onClick={handleStop}
                    className="w-24 h-24 rounded-full bg-brand-500 flex items-center justify-center"
                    style={{ boxShadow: '0 0 30px rgba(249,115,22,0.35)' }}
                  >
                    <Square className="w-8 h-8 text-white fill-white" />
                  </motion.button>
                </>
              )}
            </div>

            {trackState === 'idle' && (
              <p className="text-center text-gray-500 font-body text-xs mt-3">
                Profile: {profile?.weight ?? 70}kg · {profile?.height ?? 170}cm
              </p>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};