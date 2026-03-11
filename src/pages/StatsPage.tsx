// Stats page with charts
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getUserActivities, Activity } from '../firebase/activities';
import { useAppStore } from '../store/appStore';
import { AreaChartCard, BarChartCard } from '../components/charts/index';
import { StatCard, Spinner } from '../components/ui/index';
import {
  groupActivitiesByDay, getLastNDays, formatShortDate,
  formatDistance
} from '../utils/calculations';
import { TrendingUp, Footprints, Flame, Zap } from 'lucide-react';

export const StatsPage: React.FC = () => {
  const { user, profile } = useAppStore();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserActivities(user.uid, 100)
      .then(setActivities)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const last14Days = getLastNDays(14);
  const grouped = groupActivitiesByDay(activities);

  const distanceData = last14Days.map(d => ({
    name: formatShortDate(d),
    value: parseFloat((grouped[d]?.distance || 0).toFixed(2)),
  }));

  const stepsData = last14Days.map(d => ({
    name: formatShortDate(d),
    value: grouped[d]?.steps || 0,
  }));

  const caloriesData = last14Days.map(d => ({
    name: formatShortDate(d),
    value: grouped[d]?.calories || 0,
  }));

  const countData = last14Days.map(d => ({
    name: formatShortDate(d),
    value: grouped[d]?.count || 0,
  }));

  // Averages
  const activeDays = last14Days.filter(d => grouped[d]).length;
  const totalKm = activities.reduce((s, a) => s + a.distance, 0) / 1000;
  const avgKmPerRun = activities.length ? totalKm / activities.length : 0;

  const totalRunTime = activities.reduce((s, a) => s + a.duration, 0);
  const totalHours = Math.floor(totalRunTime / 3600);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide">
          YOUR <span className="text-gradient">STATS</span>
        </h1>
        <p className="text-gray-400 font-body text-sm mt-1">14-day performance overview</p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Lifetime Distance"
          value={formatDistance(profile?.totalDistance || 0).split(' ')[0]}
          unit={formatDistance(profile?.totalDistance || 0).split(' ')[1]}
          icon={<TrendingUp className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          label="Avg Distance / Run"
          value={avgKmPerRun.toFixed(2)}
          unit="km"
          icon={<Zap className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          label="Total Run Time"
          value={totalHours.toString()}
          unit="hours"
          icon={<Footprints className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Active Days (14d)"
          value={activeDays.toString()}
          unit="days"
          icon={<Flame className="w-5 h-5" />}
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AreaChartCard data={distanceData} title="Distance (km) — 14 Days" unit="km" />
        <BarChartCard data={stepsData} title="Daily Steps — 14 Days" color="#60a5fa" unit="steps" />
        <AreaChartCard data={caloriesData} title="Calories Burned — 14 Days" color="#f43f5e" unit="kcal" />
        <BarChartCard data={countData} title="Activities Per Day" color="#a78bfa" unit="activities" />
      </div>

      {/* Activity type breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-body font-semibold text-sm uppercase tracking-widest text-gray-400 mb-4">
          Activity Breakdown
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              type: 'run',
              count: activities.filter(a => a.type === 'run').length,
              distance: activities.filter(a => a.type === 'run').reduce((s, a) => s + a.distance, 0),
              color: 'brand',
              label: '🏃 Runs',
            },
            {
              type: 'walk',
              count: activities.filter(a => a.type === 'walk').length,
              distance: activities.filter(a => a.type === 'walk').reduce((s, a) => s + a.distance, 0),
              color: 'blue',
              label: '🚶 Walks',
            },
          ].map(t => (
            <div key={t.type} className="bg-night-800/60 rounded-xl p-5 text-center">
              <p className="font-body font-semibold text-white text-lg">{t.label}</p>
              <p className="font-display text-4xl text-white mt-2">{t.count}</p>
              <p className="text-gray-400 font-body text-sm mt-1">{formatDistance(t.distance)}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
