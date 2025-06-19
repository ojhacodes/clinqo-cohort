import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const NavBar: React.FC = () => {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 w-full z-30 px-6 sm:px-8 py-4 backdrop-blur-md bg-white/40 dark:bg-slate-900/60 border-b border-white/30 dark:border-slate-700/50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl shadow-md flex items-center justify-center">
            <Stethoscope className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Clinqo</span>
        </div>

        {/* Navigation Items - Desktop */}
        <div className="hidden md:flex items-center gap-8 text-slate-700 dark:text-slate-300 font-medium">
          <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors duration-200">Features</a>
          <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors duration-200">About</a>
          <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors duration-200">Contact</a>
          <ThemeToggle />
          <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-all duration-200 shadow hover:shadow-md">
            Sign In
          </button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-3">
          <ThemeToggle />
          <button className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors duration-200">
            <Menu className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default NavBar;