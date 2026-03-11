// Profile setup page — shown after first login
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Target } from 'lucide-react';
import { updateUserProfile } from '../firebase/auth';
import { useAppStore } from '../store/appStore';
import { Button, Input, Select } from '../components/ui/index';

const steps = ['Personal Info', 'Body Stats', 'Fitness Goal'];

export const ProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setProfile } = useAppStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    bodyType: 'average',
    fitnessGoal: 'fitness',
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const profileData = {
        age: parseInt(form.age) || 25,
        gender: form.gender as 'male' | 'female' | 'other',
        height: parseInt(form.height) || 170,
        weight: parseInt(form.weight) || 70,
        bodyType: form.bodyType as 'slim' | 'average' | 'athletic' | 'heavy',
        fitnessGoal: form.fitnessGoal as 'weight_loss' | 'endurance' | 'fitness' | 'casual',
        profileComplete: true,
      };
      await updateUserProfile(user.uid, profileData);
      setProfile({ ...profileData, uid: user.uid, email: user.email || '', name: user.displayName || '', totalDistance: 0, totalSteps: 0, totalCalories: 0, maxSpeed: 0, totalActivities: 0 });
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const stepContent = [
    // Step 0 — Personal
    <div key="personal" className="space-y-4">
      <Input
        label="Your Age"
        type="number"
        placeholder="25"
        value={form.age}
        onChange={e => update('age', e.target.value)}
        min="10" max="100"
      />
      <Select
        label="Gender"
        value={form.gender}
        onChange={e => update('gender', e.target.value)}
        options={[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other / Prefer not to say' },
        ]}
      />
    </div>,
    // Step 1 — Body
    <div key="body" className="space-y-4">
      <Input
        label="Height (cm)"
        type="number"
        placeholder="170"
        value={form.height}
        onChange={e => update('height', e.target.value)}
        min="100" max="250"
      />
      <Input
        label="Weight (kg)"
        type="number"
        placeholder="70"
        value={form.weight}
        onChange={e => update('weight', e.target.value)}
        min="30" max="300"
      />
      <Select
        label="Body Type"
        value={form.bodyType}
        onChange={e => update('bodyType', e.target.value)}
        options={[
          { value: 'slim', label: 'Slim' },
          { value: 'average', label: 'Average' },
          { value: 'athletic', label: 'Athletic' },
          { value: 'heavy', label: 'Heavy' },
        ]}
      />
    </div>,
    // Step 2 — Goal
    <div key="goal" className="space-y-3">
      {[
        { value: 'weight_loss', label: '🔥 Weight Loss', desc: 'Burn fat and shed pounds' },
        { value: 'endurance', label: '🏃 Build Endurance', desc: 'Run farther, longer' },
        { value: 'fitness', label: '💪 General Fitness', desc: 'Stay healthy and active' },
        { value: 'casual', label: '🌿 Casual Walking', desc: 'Light daily movement' },
      ].map(g => (
        <button
          key={g.value}
          onClick={() => update('fitnessGoal', g.value)}
          className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
            form.fitnessGoal === g.value
              ? 'border-brand-500 bg-brand-500/10'
              : 'border-night-700 bg-night-800/50 hover:border-night-600'
          }`}
        >
          <p className="font-body font-semibold text-white text-sm">{g.label}</p>
          <p className="font-body text-xs text-gray-400 mt-0.5">{g.desc}</p>
        </button>
      ))}
    </div>,
  ];

  return (
    <div className="min-h-screen bg-night-950 flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/4 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {step === 2 ? <Target className="w-7 h-7 text-brand-400" /> : <User className="w-7 h-7 text-brand-400" />}
          </div>
          <h1 className="font-body font-bold text-2xl text-white">Complete Your Profile</h1>
          <p className="text-gray-400 font-body text-sm mt-1">
            {step === 0 && 'Tell us a bit about yourself'}
            {step === 1 && 'Your stats help us personalize tracking'}
            {step === 2 && 'What are you training for?'}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${i <= step ? 'text-brand-400' : 'text-gray-600'}`}>
                <div className={`w-7 h-7 rounded-full border text-xs font-body font-bold flex items-center justify-center transition-all ${
                  i < step ? 'bg-brand-500 border-brand-500 text-white' :
                  i === step ? 'border-brand-500 text-brand-400' :
                  'border-night-700 text-gray-600'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs font-body hidden sm:block">{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 transition-all ${i < step ? 'bg-brand-500' : 'bg-night-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="glass rounded-3xl p-8 border border-night-700/50">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {stepContent[step]}
          </motion.div>

          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="flex-1 justify-center">
                Back
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} className="flex-1 justify-center">
                Continue
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading} className="flex-1 justify-center">
                Let's Go! 🚀
              </Button>
            )}
          </div>
        </div>

        <p className="text-center mt-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-300 font-body text-sm transition-colors"
          >
            Skip for now
          </button>
        </p>
      </motion.div>
    </div>
  );
};
