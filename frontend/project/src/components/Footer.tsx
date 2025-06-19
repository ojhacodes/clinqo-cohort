import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.8 }}
      className="w-full px-6 sm:px-8 py-6 bg-white/40 dark:bg-slate-900/60 backdrop-blur-md border-t border-white/30 dark:border-slate-700/50 shadow-inner"
    >
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
          <span>Made with</span>
          <Heart className="w-4 h-4 text-red-400 dark:text-red-500 fill-current" />
          <span>by the Clinqo Team</span>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;