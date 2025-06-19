import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import HeroSection from './components/HeroSection';
import AppLayout from './components/AppLayout';

type AppState = 'hero' | 'dashboard';

function App() {
  const [currentView, setCurrentView] = useState<AppState>('hero');

  const handleStartDiagnosis = () => {
    setCurrentView('dashboard');
  };

  const handleBackToHome = () => {
    setCurrentView('hero');
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden transition-colors duration-500">
        {/* Floating background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-800/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 dark:bg-purple-800/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-200 dark:bg-pink-800/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-pulse delay-500"></div>
        </div>

        <AnimatePresence mode="wait">
          {currentView === 'hero' ? (
            <HeroSection key="hero" onStartDiagnosis={handleStartDiagnosis} />
          ) : (
            <AppLayout key="dashboard" onBackToHome={handleBackToHome} />
          )}
        </AnimatePresence>
      </div>
    </ThemeProvider>
  );
}

export default App;