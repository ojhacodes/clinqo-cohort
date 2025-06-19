import React from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, CheckCircle, TrendingUp, Activity } from 'lucide-react';

interface Diagnosis {
  condition: string;
  confidence?: number;
  description?: string;
  severity?: 'low' | 'medium' | 'high';
  likelihood?: string;
}

interface DiagnosisPanelProps {
  diagnoses: Diagnosis[];
}

const DiagnosisPanel: React.FC<DiagnosisPanelProps> = ({ diagnoses }) => {
  const getSeverityColor = (severity?: string, confidence?: number) => {
    // Use confidence if severity is not provided
    const level = severity || (confidence && confidence > 0.8 ? 'high' : confidence && confidence > 0.6 ? 'medium' : 'low');
    
    switch (level) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  const getSeverityIcon = (severity?: string, confidence?: number) => {
    const level = severity || (confidence && confidence > 0.8 ? 'high' : confidence && confidence > 0.6 ? 'medium' : 'low');
    
    switch (level) {
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <TrendingUp className="w-4 h-4" />;
      case 'low':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getConfidencePercentage = (confidence?: number) => {
    if (confidence) return Math.round(confidence * 100);
    return null;
  };

  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="bg-white/60 dark:bg-slate-800/70 backdrop-blur-sm border border-white/30 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-lg"
    >
      {/* Header */}
      <div className="border-b border-white/20 dark:border-slate-700/50 p-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Diagnosis</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">Possible conditions based on symptoms</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {diagnoses.length > 0 ? (
          <div className="space-y-4">
            {diagnoses.map((diagnosis, index) => {
              const confidencePercentage = getConfidencePercentage(diagnosis.confidence);
              
              return (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 rounded-xl p-5 hover:bg-white/80 dark:hover:bg-slate-900/60 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg border ${getSeverityColor(diagnosis.severity, diagnosis.confidence)}`}>
                        {getSeverityIcon(diagnosis.severity, diagnosis.confidence)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white text-base mb-1">
                          {diagnosis.condition}
                        </h4>
                        {diagnosis.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {diagnosis.description}
                          </p>
                        )}
                        {diagnosis.likelihood && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Likelihood: {diagnosis.likelihood}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Confidence Badge */}
                    {confidencePercentage && (
                      <div className="ml-3">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          confidencePercentage >= 80 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                            : confidencePercentage >= 60 
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}>
                          {confidencePercentage}%
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Confidence Bar */}
                  {confidencePercentage && (
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${confidencePercentage}%` }}
                        transition={{ delay: 0.3 + (0.1 * index), duration: 0.8 }}
                        className={`h-2 rounded-full ${
                          confidencePercentage >= 80 
                            ? 'bg-green-500' 
                            : confidencePercentage >= 60 
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Diagnosis will appear here after processing</p>
          </div>
        )}
        
        {/* Disclaimer */}
        {diagnoses.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 rounded-xl"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-700 dark:text-amber-300">
                <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DiagnosisPanel;