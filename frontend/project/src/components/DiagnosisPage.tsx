import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Loader2, Copy, Download, CheckCircle, AlertTriangle, Activity } from 'lucide-react';

interface DiagnosisPageProps {
  transcript: string;
  onBack: () => void;
}

const DiagnosisPage: React.FC<DiagnosisPageProps> = ({ transcript, onBack }) => {
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateDiagnosis();
  }, [transcript]);

  const generateDiagnosis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/ai/diagnosis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setDiagnosis(data.diagnosis || 'No diagnosis generated.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to generate diagnosis');
      }
    } catch (error) {
      console.error('Error generating diagnosis:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(diagnosis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([diagnosis], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnosis-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto mt-8"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Diagnosis</h1>
            <p className="text-slate-600 dark:text-slate-300">Intelligent medical analysis</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Original Transcript */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/60 dark:bg-slate-800/70 backdrop-blur-sm border border-white/30 dark:border-slate-700/50 rounded-2xl p-6 shadow-lg h-fit"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Reported Symptoms</h3>
            <div className="bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-4 max-h-80 overflow-y-auto">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {transcript}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Diagnosis */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/60 dark:bg-slate-800/70 backdrop-blur-sm border border-white/30 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-lg"
          >
            {/* Header */}
            <div className="border-b border-white/20 dark:border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Diagnostic Analysis</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">AI-powered medical insights</p>
                  </div>
                </div>
                
                {!loading && !error && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg transition-colors duration-200"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-sm">Copy</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors duration-200"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Download</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="relative">
                      <Activity className="w-8 h-8 text-purple-500 mx-auto mb-4 animate-pulse" />
                      <Loader2 className="w-6 h-6 animate-spin text-purple-400 absolute top-1 left-1/2 transform -translate-x-1/2" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">Analyzing symptoms...</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">AI is processing your medical data</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-xl p-6">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">Analysis Failed</h4>
                    <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
                    <button
                      onClick={generateDiagnosis}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      Retry Analysis
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Diagnosis Content */}
                  <div className="bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-6 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200 font-mono leading-relaxed">
                      {diagnosis}
                    </pre>
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-amber-700 dark:text-amber-300">
                        <strong>Medical Disclaimer:</strong> This AI diagnosis is for informational purposes only and should not replace professional medical consultation. Please seek advice from a qualified healthcare provider for accurate diagnosis and treatment.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default DiagnosisPage;