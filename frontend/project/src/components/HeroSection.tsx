import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, ArrowRight, Sparkles } from 'lucide-react';
import NavBar from './NavBar';
import Footer from './Footer';

interface HeroSectionProps {
  onStartDiagnosis: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onStartDiagnosis }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col relative z-10 font-[Inter]"
    >
      <NavBar />

      <main className="flex-1 flex items-center justify-center px-6 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo and Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2.5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/40 dark:border-slate-700/50 rounded-full px-4 py-2 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 rounded-full flex items-center justify-center">
                <Stethoscope className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-blue-700 dark:text-blue-300 font-semibold text-sm">Clinqo AI</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6"
          >
            <span className="bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#312e81] dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
              Clinqo
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Voice-powered Medical Intelligence
            <br />
            <span className="text-lg text-slate-500 dark:text-slate-400">
              Transform audio symptoms into precise medical insights
            </span>
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mb-12"
          >
            <button
              onClick={onStartDiagnosis}
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-indigo-400/40 dark:hover:shadow-indigo-500/30"
            >
              Start Diagnosis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            {[
              { title: 'Voice Recognition', desc: 'Advanced speech-to-text processing' },
              { title: 'AI Analysis', desc: 'Medical entity extraction & insights' },
              { title: 'Smart Prescriptions', desc: 'Evidence-based recommendations' }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-md border border-white/40 dark:border-slate-700/50 rounded-2xl p-6 hover:bg-white/40 dark:hover:bg-slate-800/40 hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </main>

      <Footer />
    </motion.div>
  );
};

export default HeroSection;