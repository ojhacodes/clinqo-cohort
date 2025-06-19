import React from 'react';
import { motion } from 'framer-motion';
import { Activity, User, Clock, MapPin, AlertCircle, Stethoscope, Heart } from 'lucide-react';

interface Entity {
  type: string;
  value: string;
  confidence: number;
}

interface EntityCardProps {
  entity: Entity;
}

const getEntityIcon = (type: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'Age': <User className="w-4 h-4" />,
    'Gender': <User className="w-4 h-4" />,
    'Chief Complaint': <AlertCircle className="w-4 h-4" />,
    'Duration': <Clock className="w-4 h-4" />,
    'Associated Symptoms': <Activity className="w-4 h-4" />,
    'Pain Quality': <Heart className="w-4 h-4" />,
    'Location': <MapPin className="w-4 h-4" />,
    'default': <Stethoscope className="w-4 h-4" />
  };
  
  return iconMap[type] || iconMap['default'];
};

const getEntityColor = (type: string) => {
  const colorMap: { [key: string]: string } = {
    'Age': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'Gender': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    'Chief Complaint': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    'Duration': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    'Associated Symptoms': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    'Pain Quality': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    'Location': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    'default': 'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  };
  
  return colorMap[type] || colorMap['default'];
};

const EntityCard: React.FC<EntityCardProps> = ({ entity }) => {
  const confidencePercentage = Math.round(entity.confidence * 100);
  
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/30 dark:border-slate-700/50 rounded-xl p-4 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border ${getEntityColor(entity.type)}`}>
            {getEntityIcon(entity.type)}
          </div>
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white text-sm">{entity.type}</h4>
            <p className="text-slate-700 dark:text-slate-300 font-semibold">{entity.value}</p>
          </div>
        </div>
        
        {/* Confidence Badge */}
        <div className="text-right">
          <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
            confidencePercentage >= 90 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
              : confidencePercentage >= 80 
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
          }`}>
            {confidencePercentage}%
          </div>
        </div>
      </div>
      
      {/* Confidence Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${confidencePercentage}%` }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className={`h-1.5 rounded-full ${
            confidencePercentage >= 90 
              ? 'bg-green-500' 
              : confidencePercentage >= 80 
                ? 'bg-yellow-500'
                : 'bg-red-500'
          }`}
        />
      </div>
    </motion.div>
  );
};

export default EntityCard;