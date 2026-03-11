// Landing page — public, pre-auth
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, MapPin, Flame, Activity, Timer, TrendingUp,
  ChevronRight, Star, Shield, Smartphone
} from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'GPS Precision Tracking',
    desc: 'Real-time route mapping with Haversine distance calculation for pinpoint accuracy.',
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
  },
  {
    icon: Flame,
    title: 'Calorie Intelligence',
    desc: 'MET-based calorie calculation personalized to your weight, height, and activity intensity.',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    icon: Activity,
    title: 'Step Counter',
    desc: 'Stride-based step estimation calibrated to your body measurements.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Timer,
    title: 'Live Pace Monitor',
    desc: 'Instant pace feedback so you can optimize every stride of your workout.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Progress Analytics',
    desc: 'Beautiful charts showing your weekly distance, steps, and personal records.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Shield,
    title: 'Cloud Sync',
    desc: 'Your runs safely stored in Firebase. Access your history from anywhere.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
];

const stats = [
  { value: '100K+', label: 'Runs Tracked' },
  { value: '4.9★', label: 'User Rating' },
  { value: '0ms', label: 'Latency' },
  { value: 'Free', label: 'Forever' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-night-950 text-white overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-64 h-64 bg-brand-600/3 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-48 h-48 bg-orange-600/3 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-16 py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center glow-orange-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl text-gradient tracking-wider">RunTrack</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link to="/login" className="btn-ghost text-sm hidden sm:inline-flex">
            Sign In
          </Link>
          <Link to="/signup" className="btn-primary text-sm">
            Get Started Free
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 md:px-16 pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-brand-400 text-sm font-body font-medium mb-8 border border-brand-500/20">
            <Star className="w-3 h-3 fill-current" />
            Free running tracker — no subscription needed
          </span>

          <h1 className="font-display text-[clamp(4rem,12vw,9rem)] leading-none text-white mb-6 tracking-wide">
            TRACK YOUR
            <br />
            <span className="text-gradient">EVERY STRIDE</span>
          </h1>

          <p className="text-gray-400 font-body text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            RunTrack uses your phone's GPS to measure distance, speed, steps, and calories in real-time.
            Train smarter. Run faster. Go further.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/signup" className="btn-primary text-base gap-2">
              Start Tracking Free <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-ghost text-base border border-night-700">
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-8 md:gap-16 mt-16 flex-wrap"
        >
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl md:text-4xl text-gradient">{s.value}</p>
              <p className="text-gray-500 text-xs font-body uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Fake App Preview */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 px-6 md:px-16 pb-24 flex justify-center"
      >
        <div className="glass rounded-3xl p-8 max-w-3xl w-full border border-brand-500/10 glow-orange">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Distance', value: '5.24', unit: 'km' },
              { label: 'Pace', value: '5:12', unit: '/km' },
              { label: 'Steps', value: '7,832', unit: '' },
              { label: 'Calories', value: '389', unit: 'kcal' },
            ].map(m => (
              <div key={m.label} className="bg-night-800/80 rounded-2xl p-4 text-center">
                <p className="text-gray-500 text-xs font-body uppercase tracking-widest mb-2">{m.label}</p>
                <p className="font-display text-3xl text-white">{m.value}</p>
                {m.unit && <p className="text-gray-500 text-xs font-body mt-1">{m.unit}</p>}
              </div>
            ))}
          </div>
          <div className="bg-night-800/50 rounded-xl h-24 flex items-center justify-center">
            <div className="flex gap-1">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-brand-500/60 rounded-full"
                  style={{ height: `${20 + Math.sin(i * 0.5) * 20 + Math.random() * 30}px`, opacity: 0.5 + (i / 40) * 0.5 }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center mt-6">
            <div className="flex items-center gap-3 bg-night-800/80 px-6 py-3 rounded-2xl">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-brand-400 font-body font-semibold text-sm">TRACKING LIVE</span>
              <span className="font-mono text-white text-sm">32:47</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <section className="relative z-10 px-6 md:px-16 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-5xl md:text-7xl text-white mb-4 tracking-wide">
            EVERYTHING YOU NEED
          </h2>
          <p className="text-gray-400 font-body text-lg max-w-xl mx-auto">
            Professional-grade tracking in a free, beautiful app.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto"
        >
          {features.map(f => (
            <motion.div
              key={f.title}
              variants={item}
              whileHover={{ scale: 1.02 }}
              className="glass rounded-2xl p-6"
            >
              <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="font-body font-semibold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 font-body text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-6 md:px-16 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-5xl md:text-7xl text-white mb-4 tracking-wide">
            HOW IT <span className="text-gradient">WORKS</span>
          </h2>
        </motion.div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Create Account', desc: 'Sign up free with email or Google in seconds.' },
            { step: '02', title: 'Set Your Profile', desc: 'Add height and weight for personalized calorie tracking.' },
            { step: '03', title: 'Hit Go', desc: 'Press start and run. We handle the rest.' },
          ].map(s => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="font-display text-7xl text-brand-500/20 mb-4">{s.step}</div>
              <h3 className="font-body font-bold text-white text-xl mb-2">{s.title}</h3>
              <p className="text-gray-400 font-body text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 md:px-16 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto glass rounded-3xl p-12 border border-brand-500/15 glow-orange"
        >
          <Smartphone className="w-12 h-12 text-brand-500 mx-auto mb-6" />
          <h2 className="font-display text-5xl text-white mb-4 tracking-wide">READY TO RUN?</h2>
          <p className="text-gray-400 font-body mb-8">
            Join thousands of runners tracking their progress with RunTrack. Free, forever.
          </p>
          <Link to="/signup" className="btn-primary text-lg mx-auto inline-flex">
            Start for Free <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-night-800 px-6 md:px-16 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-500" />
            <span className="font-display text-lg text-gradient">RunTrack</span>
          </div>
          <p className="text-gray-600 font-body text-sm">
            © {new Date().getFullYear()} RunTrack. Built with ❤️ for runners.
          </p>
          <div className="flex gap-6">
            <Link to="/login" className="text-gray-500 hover:text-gray-300 font-body text-sm transition-colors">Login</Link>
            <Link to="/signup" className="text-gray-500 hover:text-gray-300 font-body text-sm transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
