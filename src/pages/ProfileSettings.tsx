// Profile and Settings pages
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Save, AlertCircle, Check, Zap, Weight, Ruler, Target } from 'lucide-react';
import { updateUserProfile } from '../firebase/auth';
import { useAppStore } from '../store/appStore';
import { getUserProfile } from '../firebase/auth';
import { Button, Input, Select } from '../components/ui/index';
import { getBMI } from '../utils/calculations';

// ─── Profile Page ──────────────────────────────────────────────────────────────
export const ProfilePage: React.FC = () => {
  const { user, profile, setProfile } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    gender: 'male',
    bodyType: 'average',
    fitnessGoal: 'fitness',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        age: profile.age?.toString() || '',
        height: profile.height?.toString() || '',
        weight: profile.weight?.toString() || '',
        gender: profile.gender || 'male',
        bodyType: profile.bodyType || 'average',
        fitnessGoal: profile.fitnessGoal || 'fitness',
      });
    }
  }, [profile]);

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!user) return;
    setError('');
    setLoading(true);
    try {
      const updates = {
        name: form.name,
        age: parseInt(form.age) || 25,
        height: parseInt(form.height) || 170,
        weight: parseInt(form.weight) || 70,
        gender: form.gender as 'male' | 'female' | 'other',
        bodyType: form.bodyType as 'slim' | 'average' | 'athletic' | 'heavy',
        fitnessGoal: form.fitnessGoal as 'weight_loss' | 'endurance' | 'fitness' | 'casual',
        profileComplete: true,
      };
      await updateUserProfile(user.uid, updates);
      const updated = await getUserProfile(user.uid);
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const bmi = form.height && form.weight
    ? getBMI(parseInt(form.weight), parseInt(form.height))
    : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide">
          YOUR <span className="text-gradient">PROFILE</span>
        </h1>
        <p className="text-gray-400 font-body text-sm mt-1">Edit your information and fitness settings</p>
      </motion.div>

      {/* Avatar + name display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-6 flex items-center gap-5"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-display text-4xl glow-orange-sm flex-shrink-0">
          {(form.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-body font-bold text-white text-xl">{form.name || 'Your Name'}</p>
          <p className="text-gray-400 font-body text-sm">{user?.email}</p>
          {bmi && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-body text-gray-500">BMI:</span>
              <span className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full ${
                bmi < 18.5 ? 'bg-blue-500/20 text-blue-400' :
                bmi < 25 ? 'bg-emerald-500/20 text-emerald-400' :
                bmi < 30 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {bmi} — {bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 space-y-5"
      >
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-red-400 text-sm font-body">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-gray-500" />
          <h3 className="font-body font-semibold text-white text-sm uppercase tracking-widest">Personal Info</h3>
        </div>

        <Input label="Full Name" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your name" />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Age" type="number" value={form.age} onChange={e => update('age', e.target.value)} placeholder="25" min="10" max="100" />
          <Select label="Gender" value={form.gender} onChange={e => update('gender', e.target.value)} options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
          ]} />
        </div>

        <div className="h-px bg-night-700" />

        <div className="flex items-center gap-2 mb-2">
          <Ruler className="w-4 h-4 text-gray-500" />
          <h3 className="font-body font-semibold text-white text-sm uppercase tracking-widest">Body Stats</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Height (cm)" type="number" value={form.height} onChange={e => update('height', e.target.value)} placeholder="170" min="100" max="250" icon={<Ruler className="w-4 h-4" />} />
          <Input label="Weight (kg)" type="number" value={form.weight} onChange={e => update('weight', e.target.value)} placeholder="70" min="30" max="300" icon={<Weight className="w-4 h-4" />} />
        </div>

        <Select label="Body Type" value={form.bodyType} onChange={e => update('bodyType', e.target.value)} options={[
          { value: 'slim', label: 'Slim' },
          { value: 'average', label: 'Average' },
          { value: 'athletic', label: 'Athletic' },
          { value: 'heavy', label: 'Heavy' },
        ]} />

        <div className="h-px bg-night-700" />

        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-gray-500" />
          <h3 className="font-body font-semibold text-white text-sm uppercase tracking-widest">Fitness Goal</h3>
        </div>

        <Select label="Primary Goal" value={form.fitnessGoal} onChange={e => update('fitnessGoal', e.target.value)} options={[
          { value: 'weight_loss', label: '🔥 Weight Loss' },
          { value: 'endurance', label: '🏃 Build Endurance' },
          { value: 'fitness', label: '💪 General Fitness' },
          { value: 'casual', label: '🌿 Casual Walking' },
        ]} />

        <Button onClick={handleSave} loading={loading} className="w-full justify-center mt-2" icon={saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}>
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </motion.div>
    </div>
  );
};

// ─── Settings Page ─────────────────────────────────────────────────────────────
export const SettingsPage: React.FC = () => {
  const { profile } = useAppStore();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide">
          SETTINGS
        </h1>
        <p className="text-gray-400 font-body text-sm mt-1">App preferences and account info</p>
      </motion.div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="font-body font-semibold text-sm uppercase tracking-widest text-gray-400">App Info</h3>
        {[
          { label: 'App Version', value: '1.0.0' },
          { label: 'Build', value: 'Production' },
          { label: 'Database', value: 'Firebase Firestore' },
          { label: 'Auth', value: 'Firebase Auth' },
        ].map(item => (
          <div key={item.label} className="flex justify-between items-center py-2">
            <span className="text-gray-400 font-body text-sm">{item.label}</span>
            <span className="text-white font-mono text-sm">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="font-body font-semibold text-sm uppercase tracking-widest text-gray-400">Tracking Config</h3>
        {[
          { label: 'GPS Accuracy', value: 'High (< 50m)' },
          { label: 'Update Interval', value: 'Real-time' },
          { label: 'Min Step Threshold', value: '2 meters' },
          { label: 'Run/Walk Threshold', value: '7 km/h' },
          { label: 'Stride Factor', value: '0.415 × height' },
        ].map(item => (
          <div key={item.label} className="flex justify-between items-center py-2">
            <span className="text-gray-400 font-body text-sm">{item.label}</span>
            <span className="text-brand-400 font-mono text-sm">{item.value}</span>
          </div>
        ))}
      </div>

      {profile && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-body font-semibold text-sm uppercase tracking-widest text-gray-400 mb-4">Active Calorie Profile</h3>
          <div className="bg-night-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-brand-400" />
              <span className="text-white font-body font-medium text-sm">MET-based formula</span>
            </div>
            <p className="text-gray-400 font-body text-xs leading-relaxed">
              Calories = MET × {profile.weight || 70}kg × duration(h)<br />
              Running MET = 9.8 · Walking MET = 3.8<br />
              Stride length = {((profile.height || 170) * 0.415 / 100).toFixed(2)}m ({profile.height || 170}cm × 0.415)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
