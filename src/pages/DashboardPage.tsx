// Dashboard page — main authenticated home
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Footprints, Flame, TrendingUp, MapPin, Zap, ChevronRight, Trophy } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { getTodayActivities, getUserActivities, Activity } from '../firebase/activities';
import { StatCard, SkeletonCard, Badge } from '../components/ui/index';
import { AreaChartCard, BarChartCard } from '../components/charts/index';
import {
  formatDistance, formatDuration, getLastNDays, formatShortDate,
  groupActivitiesByDay
} from '../utils/calculations';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAppStore();
  const [todayActivities, setTodayActivities] = useState<Activity[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [today, recent] = await Promise.all([
          getTodayActivities(user.uid),
          getUserActivities(user.uid, 7),
        ]);
        setTodayActivities(today);
        setRecentActivities(recent);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Today stats
  const todayDistance = todayActivities.reduce((s, a) => s + a.distance, 0);
  const todaySteps = todayActivities.reduce((s, a) => s + a.steps, 0);
  const todayCalories = todayActivities.reduce((s, a) => s + a.calories, 0);

  // Weekly chart data
  const last7Days = getLastNDays(7);
  const grouped = groupActivitiesByDay(recentActivities);
  const weeklyData = last7Days.map(d => ({
    name: formatShortDate(d),
    value: parseFloat((grouped[d]?.distance || 0).toFixed(2)),
  }));

  const stepsData = last7Days.map(d => ({
    name: formatShortDate(d),
    value: grouped[d]?.steps || 0,
  }));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <p className="text-gray-400 font-body text-sm uppercase tracking-widest">{greeting()}</p>
          <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide mt-1">
            {profile?.name?.split(' ')[0] || 'Runner'} 👋
          </h1>
        </div>
        <Link to="/track" className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto">
          <Play className="w-4 h-4" />
          Start Activity
        </Link>
      </motion.div>

      {/* Today Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <motion.div variants={item}>
              <StatCard
                label="Today's Distance"
                value={formatDistance(todayDistance).split(' ')[0]}
                unit={formatDistance(todayDistance).split(' ')[1]}
                icon={<MapPin className="w-5 h-5" />}
                color="brand"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatCard
                label="Today's Steps"
                value={todaySteps.toLocaleString()}
                icon={<Footprints className="w-5 h-5" />}
                color="blue"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatCard
                label="Calories Burned"
                value={todayCalories}
                unit="kcal"
                icon={<Flame className="w-5 h-5" />}
                color="red"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatCard
                label="Total Distance"
                value={formatDistance(profile?.totalDistance || 0).split(' ')[0]}
                unit={formatDistance(profile?.totalDistance || 0).split(' ')[1]}
                icon={<TrendingUp className="w-5 h-5" />}
                color="green"
              />
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <AreaChartCard data={weeklyData} title="Weekly Distance (km)" unit="km" />
        <BarChartCard data={stepsData} title="Daily Steps" color="#60a5fa" unit="steps" />
      </motion.div>

      {/* All-time records + Recent activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Records */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="font-body font-semibold text-white">Personal Records</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-body text-sm">Total Runs</span>
              <span className="text-white font-mono font-semibold">{profile?.totalActivities || 0}</span>
            </div>
            <div className="h-px bg-night-700" />
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-body text-sm">Total Steps</span>
              <span className="text-white font-mono font-semibold">
                {(profile?.totalSteps || 0).toLocaleString()}
              </span>
            </div>
            <div className="h-px bg-night-700" />
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-body text-sm">Total Calories</span>
              <span className="text-white font-mono font-semibold">
                {(profile?.totalCalories || 0).toLocaleString()} kcal
              </span>
            </div>
            <div className="h-px bg-night-700" />
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-body text-sm">Max Speed</span>
              <span className="text-brand-400 font-mono font-semibold">
                {(profile?.maxSpeed || 0).toFixed(1)} km/h
              </span>
            </div>
          </div>
        </motion.div>

        {/* Recent activities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-400" />
              <h2 className="font-body font-semibold text-white">Recent Activities</h2>
            </div>
            <Link to="/history" className="text-brand-400 text-sm font-body flex items-center gap-1 hover:text-brand-300">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 skeleton rounded-xl" />
              ))}
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <Play className="w-10 h-10 text-night-700 mx-auto mb-3" />
              <p className="text-gray-500 font-body text-sm">No activities yet. Start your first run!</p>
              <Link to="/track" className="btn-primary inline-flex mt-4 text-sm">
                Start Tracking
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivities.slice(0, 5).map(activity => (
                <Link
                  key={activity.id}
                  to={`/activity/${activity.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl bg-night-800/50 hover:bg-night-800 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'run' ? 'bg-brand-500/20' : 'bg-blue-500/20'
                  }`}>
                    {activity.type === 'run' ? (
                      <Zap className="w-5 h-5 text-brand-400" />
                    ) : (
                      <Footprints className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={activity.type}>{activity.type === 'run' ? 'Run' : 'Walk'}</Badge>
                      <span className="text-gray-500 text-xs font-body">{activity.date}</span>
                    </div>
                    <p className="text-white font-body font-semibold text-sm mt-0.5">
                      {formatDistance(activity.distance)} · {formatDuration(activity.duration)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-brand-400 font-mono text-sm font-semibold">
                      {activity.avgSpeed.toFixed(1)} km/h
                    </p>
                    <p className="text-gray-500 text-xs font-body">{activity.calories} kcal</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-night-600 group-hover:text-gray-400 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
