// History page and Activity Detail page
import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Zap, Footprints, Flame, Timer, Gauge, MapPin, TrendingUp, ArrowLeft, Calendar } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { getUserActivities, getActivity, Activity } from '../firebase/activities';
import { Badge, EmptyState, Spinner } from '../components/ui/index';
import { formatDuration, formatDistance, formatPace, formatRelativeDate } from '../utils/calculations';

// ─── History Page ─────────────────────────────────────────────────────────────
export const HistoryPage: React.FC = () => {
  const { user } = useAppStore();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserActivities(user.uid, 20)
      .then(setActivities)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const loadMore = async () => {
    if (!user) return;
    setLoadingMore(true);
    try {
      const more = await getUserActivities(user.uid, activities.length + 20);
      setActivities(more);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide">
          ACTIVITY <span className="text-gradient">HISTORY</span>
        </h1>
        <p className="text-gray-400 font-body text-sm mt-1">All your runs and walks</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : activities.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-8 h-8" />}
          title="No activities yet"
          description="Your completed runs and walks will appear here."
          action={
            <Link to="/track" className="btn-primary text-sm">
              Start Your First Activity
            </Link>
          }
        />
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="space-y-3"
        >
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
            >
              <Link
                to={`/activity/${activity.id}`}
                className="flex items-center gap-4 glass rounded-2xl p-5 hover:border-brand-500/20 transition-all group"
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'run' ? 'bg-brand-500/20' : 'bg-blue-500/20'
                }`}>
                  {activity.type === 'run' ? (
                    <Zap className="w-6 h-6 text-brand-400" />
                  ) : (
                    <Footprints className="w-6 h-6 text-blue-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={activity.type}>{activity.type === 'run' ? 'Run' : 'Walk'}</Badge>
                    <span className="text-gray-500 text-xs font-body">
                      {activity.createdAt
                        ? formatRelativeDate(new Date((activity.createdAt as { seconds: number }).seconds * 1000))
                        : activity.date}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span className="text-white font-body font-semibold text-sm">
                      {formatDistance(activity.distance)}
                    </span>
                    <span className="text-gray-400 font-body text-sm flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5" />{formatDuration(activity.duration)}
                    </span>
                    <span className="text-gray-400 font-body text-sm hidden sm:flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />{activity.calories} kcal
                    </span>
                  </div>
                </div>

                {/* Speed + arrow */}
                <div className="text-right flex-shrink-0 flex items-center gap-3">
                  <div>
                    <p className="text-brand-400 font-mono font-semibold text-sm">
                      {activity.avgSpeed.toFixed(1)} km/h
                    </p>
                    <p className="text-gray-500 text-xs font-body">{formatPace(activity.pace)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-night-600 group-hover:text-gray-400 transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}

          {activities.length >= 20 && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-ghost border border-night-700 text-sm"
              >
                {loadingMore ? <Spinner size="sm" /> : 'Load more'}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

// ─── Activity Detail Page ─────────────────────────────────────────────────────
export const ActivityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getActivity(id)
      .then(setActivity)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="max-w-2xl mx-auto">
        <EmptyState
          icon={<MapPin className="w-8 h-8" />}
          title="Activity not found"
          description="This activity may have been deleted."
          action={<button onClick={() => navigate('/history')} className="btn-primary text-sm">Back to History</button>}
        />
      </div>
    );
  }

  const metrics = [
    { label: 'Distance', value: formatDistance(activity.distance), icon: <MapPin className="w-5 h-5" /> },
    { label: 'Duration', value: formatDuration(activity.duration), icon: <Timer className="w-5 h-5" /> },
    { label: 'Avg Speed', value: `${activity.avgSpeed.toFixed(1)} km/h`, icon: <Gauge className="w-5 h-5" /> },
    { label: 'Max Speed', value: `${activity.maxSpeed.toFixed(1)} km/h`, icon: <Zap className="w-5 h-5" /> },
    { label: 'Pace', value: formatPace(activity.pace), icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Steps', value: activity.steps.toLocaleString(), icon: <Footprints className="w-5 h-5" /> },
    { label: 'Calories', value: `${activity.calories} kcal`, icon: <Flame className="w-5 h-5" /> },
    { label: 'Route Points', value: (activity.routePoints?.length || 0).toString(), icon: <MapPin className="w-5 h-5" /> },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-body text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            activity.type === 'run' ? 'bg-brand-500/20' : 'bg-blue-500/20'
          }`}>
            {activity.type === 'run'
              ? <Zap className="w-6 h-6 text-brand-400" />
              : <Footprints className="w-6 h-6 text-blue-400" />}
          </div>
          <div>
            <h1 className="font-display text-3xl text-white tracking-wide">
              {activity.type === 'run' ? 'RUN' : 'WALK'}
            </h1>
            <p className="text-gray-400 font-body text-sm">
              {activity.createdAt
                ? new Date((activity.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })
                : activity.date}
            </p>
          </div>
        </div>

        {/* Big distance display */}
        <div className="glass rounded-3xl p-8 text-center mt-4 glow-orange">
          <p className="text-gray-400 font-body text-xs uppercase tracking-widest mb-2">Total Distance</p>
          <div className="flex items-end justify-center gap-2">
            <span className="font-display text-7xl text-white">
              {formatDistance(activity.distance).split(' ')[0]}
            </span>
            <span className="text-gray-400 font-body text-2xl mb-3">
              {formatDistance(activity.distance).split(' ')[1]}
            </span>
          </div>
          <Badge variant={activity.type}>{activity.type === 'run' ? '🏃 Run' : '🚶 Walk'}</Badge>
        </div>
      </motion.div>

      {/* Metrics grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-3"
      >
        {metrics.map(m => (
          <div key={m.label} className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2 text-gray-500">
              {React.cloneElement(m.icon as React.ReactElement, { className: 'w-4 h-4' })}
              <span className="text-xs font-body uppercase tracking-widest">{m.label}</span>
            </div>
            <p className="text-white font-mono font-semibold text-lg">{m.value}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
