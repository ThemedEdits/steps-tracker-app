// Run/Walk Tracking page — core tracking functionality
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, MapPin, Zap, Footprints, Flame, Timer, Gauge, TrendingUp } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useTracking } from '../hooks/useTracking';
import { saveActivity } from '../firebase/activities';
import { Button } from '../components/ui/index';
import { formatDuration, formatDistance, formatPace } from '../utils/calculations';

// Live metric display
const MetricBox: React.FC<{
  label: string;
  value: string;
  unit?: string;
  icon: React.ReactNode;
  highlight?: boolean;
  className?: string;
}> = ({ label, value, unit, icon, highlight, className = '' }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`glass rounded-2xl p-5 relative overflow-hidden ${highlight ? 'border-brand-500/30' : ''} ${className}`}
  >
    {highlight && (
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl" />
    )}
    <div className="flex items-center gap-2 mb-2">
      <span className={`${highlight ? 'text-brand-400' : 'text-gray-500'}`}>{icon}</span>
      <span className="text-gray-400 text-xs font-body uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-end gap-1">
      <span className={`font-display text-4xl ${highlight ? 'text-brand-400' : 'text-white'}`}>
        {value}
      </span>
      {unit && <span className="text-gray-400 text-sm font-body mb-1">{unit}</span>}
    </div>
  </motion.div>
);

// Speed indicator ring
const SpeedRing: React.FC<{ speed: number; maxSpeed?: number }> = ({ speed, maxSpeed = 20 }) => {
  const pct = Math.min(speed / maxSpeed, 1);
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference * (1 - pct);
  const isRunning = speed >= 7;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r="54" fill="none"
          stroke={isRunning ? '#f97316' : '#60a5fa'}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl text-white leading-none">{speed.toFixed(1)}</span>
        <span className="text-gray-400 text-xs font-body">km/h</span>
        <span className={`text-xs font-body font-semibold mt-1 ${isRunning ? 'text-brand-400' : 'text-blue-400'}`}>
          {isRunning ? '🏃 RUN' : '🚶 WALK'}
        </span>
      </div>
    </div>
  );
};

export const TrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, session, startSession, pauseSession, resumeSession, resetSession } = useAppStore();
  const [gpsStatus, setGpsStatus] = useState<'checking' | 'ok' | 'denied' | 'unavailable'>('checking');
  const [showSummary, setShowSummary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  // Initialize tracking hook
  useTracking();

  // Check GPS on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('unavailable');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => setGpsStatus('ok'),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setGpsStatus('denied');
        else setGpsStatus('ok'); // Try anyway
      },
      { timeout: 5000 }
    );
  }, []);

  const handleStart = () => {
    startSession();
    setShowSummary(false);
    setSavedId(null);
  };

  const handlePause = () => {
    if (session.isActive) {
      pauseSession();
    } else if (session.isPaused) {
      resumeSession();
    }
  };

  const handleStop = useCallback(async () => {
    pauseSession();
    setShowSummary(true);
  }, [pauseSession]);

  const handleSave = async () => {
    if (!user || session.distance < 10) return; // Minimum 10m
    setSaving(true);
    try {
      const id = await saveActivity({
        userId: user.uid,
        type: session.activityType,
        distance: session.distance,
        steps: session.steps,
        calories: session.calories,
        avgSpeed: session.avgSpeed,
        maxSpeed: session.maxSpeed,
        duration: session.elapsed,
        pace: session.pace,
        routePoints: session.routePoints.slice(0, 500), // Limit stored points
      });
      setSavedId(id);
    } catch (e) {
      console.error('Failed to save:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    resetSession();
    setShowSummary(false);
  };

  const hasActivity = session.isActive || session.isPaused || showSummary;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide">
          {showSummary ? 'ACTIVITY DONE' : 'TRACK'}
          {!showSummary && <span className="text-gradient"> ACTIVITY</span>}
        </h1>
        <p className="text-gray-400 font-body text-sm mt-1">
          {showSummary ? 'Review and save your activity' :
           gpsStatus === 'ok' ? 'GPS ready — hit start when you\'re ready' :
           gpsStatus === 'denied' ? 'GPS permission denied — tracking may be limited' :
           gpsStatus === 'unavailable' ? 'GPS unavailable on this device' :
           'Checking GPS...'}
        </p>
      </motion.div>

      {/* GPS indicator */}
      {!showSummary && (
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${
            gpsStatus === 'ok' ? 'bg-emerald-400 animate-pulse' :
            gpsStatus === 'checking' ? 'bg-yellow-400 animate-pulse' :
            'bg-red-400'
          }`} />
          <span className="text-gray-400 font-body text-xs uppercase tracking-widest">
            GPS {gpsStatus === 'ok' ? 'Active' : gpsStatus === 'checking' ? 'Checking...' : 'Issue'}
          </span>
        </div>
      )}

      {/* Activity Summary Modal */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass rounded-3xl p-8 border border-brand-500/20 glow-orange"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-8 h-8 text-brand-400" />
              </div>
              <h2 className="font-display text-3xl text-white">
                {session.activityType === 'run' ? 'RUN COMPLETE' : 'WALK COMPLETE'}
              </h2>
              <p className="text-gray-400 font-body text-sm mt-1">
                {session.distance < 10 ? 'Too short to save (min 10m)' : 'Great effort! Save your activity.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Distance', value: formatDistance(session.distance) },
                { label: 'Duration', value: formatDuration(session.elapsed) },
                { label: 'Avg Speed', value: `${session.avgSpeed.toFixed(1)} km/h` },
                { label: 'Max Speed', value: `${session.maxSpeed.toFixed(1)} km/h` },
                { label: 'Steps', value: session.steps.toLocaleString() },
                { label: 'Calories', value: `${session.calories} kcal` },
                { label: 'Pace', value: formatPace(session.pace) },
                { label: 'Route Points', value: session.routePoints.length.toString() },
              ].map(m => (
                <div key={m.label} className="bg-night-800/60 rounded-xl p-4">
                  <p className="text-gray-500 text-xs font-body uppercase tracking-widest mb-1">{m.label}</p>
                  <p className="text-white font-mono font-semibold text-lg">{m.value}</p>
                </div>
              ))}
            </div>

            {savedId ? (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                  <p className="text-emerald-400 font-body font-semibold">Activity saved!</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => navigate(`/activity/${savedId}`)} className="flex-1 justify-center text-sm">
                    View Details
                  </Button>
                  <Button onClick={() => { resetSession(); setShowSummary(false); setSavedId(null); }} className="flex-1 justify-center text-sm">
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
                  disabled={session.distance < 10}
                  className="flex-1 justify-center"
                >
                  Save Activity
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live tracking display */}
      {!showSummary && (
        <>
          {/* Speed ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-3xl p-8 flex flex-col items-center"
          >
            <SpeedRing speed={session.currentSpeed} />

            {/* Timer */}
            <div className="mt-4 flex items-center gap-2">
              <Timer className="w-4 h-4 text-gray-500" />
              <span className="font-mono text-3xl text-white">{formatDuration(session.elapsed)}</span>
            </div>

            {hasActivity && (
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${session.isActive ? 'bg-brand-500 animate-pulse' : 'bg-yellow-400'}`} />
                <span className="text-gray-400 font-body text-xs uppercase tracking-widest">
                  {session.isActive ? 'Recording' : 'Paused'}
                </span>
              </div>
            )}
          </motion.div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-3">
            <MetricBox
              label="Distance"
              value={formatDistance(session.distance).split(' ')[0]}
              unit={formatDistance(session.distance).split(' ')[1]}
              icon={<MapPin className="w-4 h-4" />}
              highlight
            />
            <MetricBox
              label="Avg Speed"
              value={session.avgSpeed.toFixed(1)}
              unit="km/h"
              icon={<Gauge className="w-4 h-4" />}
            />
            <MetricBox
              label="Steps"
              value={session.steps.toLocaleString()}
              icon={<Footprints className="w-4 h-4" />}
            />
            <MetricBox
              label="Calories"
              value={session.calories.toString()}
              unit="kcal"
              icon={<Flame className="w-4 h-4" />}
            />
            <MetricBox
              label="Pace"
              value={formatPace(session.pace).split(' ')[0]}
              unit="/km"
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <MetricBox
              label="Max Speed"
              value={session.maxSpeed.toFixed(1)}
              unit="km/h"
              icon={<Zap className="w-4 h-4" />}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 py-4">
            {!hasActivity ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center glow-orange relative"
              >
                <div className="absolute inset-0 rounded-full border-2 border-brand-400/50 animate-ping" />
                <Play className="w-8 h-8 text-white ml-1" />
              </motion.button>
            ) : (
              <>
                {/* Pause/Resume */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePause}
                  className="w-16 h-16 rounded-full glass border border-night-600 flex items-center justify-center hover:border-brand-500/50 transition-colors"
                >
                  {session.isActive ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-brand-400 ml-0.5" />
                  )}
                </motion.button>

                {/* Stop */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStop}
                  className="w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center glow-orange"
                >
                  <Square className="w-7 h-7 text-white fill-white" />
                </motion.button>
              </>
            )}
          </div>

          {!hasActivity && (
            <p className="text-center text-gray-500 font-body text-sm">
              Profile: {profile?.weight || 70}kg · {profile?.height || 170}cm — affects calorie calculation
            </p>
          )}
        </>
      )}
    </div>
  );
};
