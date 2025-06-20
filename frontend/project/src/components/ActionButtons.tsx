import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Brain, Calendar, ArrowRight, Stethoscope, Pill, Clock } from 'lucide-react';

interface ActionButtonsProps {
  onPageChange: (page: 'prescription' | 'diagnosis' | 'booking') => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onPageChange }) => {
  const actions = [
    {
      id: 'prescription',
      title: 'Generate Prescription',
      description: 'Get AI-powered medication recommendations based on your symptoms',
      icon: <Pill className="w-8 h-8" />,
      gradient: 'from-emerald-500 to-teal-500',
      hoverGradient: 'from-emerald-600 to-teal-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      delay: 0.1
    },
    {
      id: 'booking',
      title: 'Book Appointment',
      description: 'Schedule a consultation with healthcare professionals',
      icon: <Calendar className="w-8 h-8" />,
      gradient: 'from-blue-500 to-indigo-500',
      hoverGradient: 'from-blue-600 to-indigo-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      delay: 0.2
    }
  ];

  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 rounded-full px-6 py-3 mb-4 shadow-lg">
          <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-blue-700 dark:text-blue-300 font-semibold">Choose Your Next Step</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          What would you like to do?
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          Select an action to continue with your medical consultation
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid gap-6 max-w-2xl mx-auto">
        {actions.map((action) => (
          <motion.div
            key={action.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: action.delay }}
            className={`group ${action.bgColor} backdrop-blur-sm border ${action.borderColor} rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
            onClick={() => onPageChange(action.id as 'prescription' | 'diagnosis' | 'booking')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`bg-gradient-to-r ${action.gradient} group-hover:${action.hoverGradient} p-4 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 text-white`}>
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-slate-700 dark:group-hover:text-slate-100 transition-colors duration-300">
                    {action.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors duration-300">
                    {action.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-300">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">~2 min</span>
                </div>
                <ArrowRight className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 rounded-2xl p-6 mt-8"
      >
        <div className="flex items-start gap-3">
          <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg flex-shrink-0">
            <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">
              Medical Disclaimer
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
              All AI-generated recommendations are for informational purposes only and should not replace professional medical advice. 
              Please consult with a qualified healthcare provider for proper diagnosis and treatment.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ActionButtons;