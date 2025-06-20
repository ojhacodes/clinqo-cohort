import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Pill, 
  Loader2, 
  Copy, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  Brain,
  Heart,
  Thermometer,
  Activity,
  Clock,
  User,
  FileText,
  Shield,
  Info,
  Star
} from 'lucide-react';
import BookingPage from './BookingPage';
import { fetcher } from '../utils/api';

interface PrescriptionPageProps {
  transcript: string;
  onBack: () => void;
}

interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  icon: React.ReactNode;
}

interface Medication {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  duration: string;
  sideEffects: string[];
  warnings: string[];
  category: string;
  prescription: boolean;
}

interface PrescriptionData {
  symptoms: Symptom[];
  medications: Medication[];
  recommendations: string[];
  followUp: string;
  emergencySigns: string[];
  generatedAt: Date;
}

const PrescriptionPage: React.FC<PrescriptionPageProps> = ({ transcript, onBack }) => {
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'medications' | 'symptoms' | 'warnings'>('overview');
  const [editedTranscript, setEditedTranscript] = useState(transcript);

  useEffect(() => {
    setEditedTranscript(transcript);
  }, [transcript]);

  useEffect(() => {
    generatePrescription();
    // eslint-disable-next-line
  }, [transcript]);

  const generatePrescription = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetcher('/ai/prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: editedTranscript }),
      });
      if (data.status === 'success' && data.prescription_data) {
        const prescriptionData = data.prescription_data.prescription;
        const symptomsWithIcons = prescriptionData.symptoms.map((symptom: any) => ({
          ...symptom,
          icon: getSymptomIcon(symptom.name)
        }));
        setPrescriptionData({
          ...prescriptionData,
          symptoms: symptomsWithIcons,
          generatedAt: new Date(data.timestamp || Date.now())
        });
      } else {
        throw new Error(data.error || 'Failed to generate prescription');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSymptomIcon = (symptomName: string) => {
    const lowerName = symptomName.toLowerCase();
    
    if (lowerName.includes('headache') || lowerName.includes('head')) {
      return <Brain className="w-5 h-5" />;
    }
    if (lowerName.includes('fever') || lowerName.includes('temperature')) {
      return <Thermometer className="w-5 h-5" />;
    }
    if (lowerName.includes('cough') || lowerName.includes('chest') || lowerName.includes('breath')) {
      return <Heart className="w-5 h-5" />;
    }
    if (lowerName.includes('fatigue') || lowerName.includes('tired')) {
      return <Activity className="w-5 h-5" />;
    }
    if (lowerName.includes('nausea') || lowerName.includes('stomach')) {
      return <User className="w-5 h-5" />;
    }
    
    return <User className="w-5 h-5" />;
  };

  const handleCopy = async () => {
    if (!prescriptionData) return;
    
    const prescriptionText = formatPrescriptionForCopy(prescriptionData);
    try {
      await navigator.clipboard.writeText(prescriptionText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (!prescriptionData) return;
    
    const prescriptionText = formatPrescriptionForCopy(prescriptionData);
    const blob = new Blob([prescriptionText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatPrescriptionForCopy = (data: PrescriptionData): string => {
    let text = 'AI-GENERATED PRESCRIPTION\n';
    text += '='.repeat(50) + '\n\n';
    text += `Generated: ${data.generatedAt.toLocaleString()}\n\n`;
    
    text += 'SYMPTOMS IDENTIFIED:\n';
    data.symptoms.forEach(symptom => {
      text += `• ${symptom.name} (${symptom.severity}): ${symptom.description}\n`;
    });
    text += '\n';
    
    text += 'MEDICATIONS RECOMMENDED:\n';
    data.medications.forEach(med => {
      text += `• ${med.name} (${med.genericName})\n`;
      text += `  Dosage: ${med.dosage}\n`;
      text += `  Frequency: ${med.frequency}\n`;
      text += `  Duration: ${med.duration}\n`;
      text += `  Category: ${med.category}\n`;
      if (med.sideEffects.length > 0) {
        text += `  Side Effects: ${med.sideEffects.join(', ')}\n`;
      }
      text += '\n';
    });
    
    text += 'RECOMMENDATIONS:\n';
    data.recommendations.forEach(rec => {
      text += `• ${rec}\n`;
    });
    text += '\n';
    
    text += 'FOLLOW-UP:\n';
    text += `${data.followUp}\n\n`;
    
    text += 'EMERGENCY SIGNS (Seek immediate medical attention):\n';
    data.emergencySigns.forEach(sign => {
      text += `• ${sign}\n`;
    });
    text += '\n';
    
    text += 'MEDICAL DISCLAIMER:\n';
    text += 'This AI-generated prescription is for informational purposes only and should not replace professional medical advice. Please consult with a qualified healthcare provider before taking any medications.\n';
    
    return text;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'moderate': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'severe': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto mt-8"
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
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-xl">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Prescription</h1>
            <p className="text-slate-600 dark:text-slate-300">Generated medication recommendations</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Original Transcript */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/60 dark:bg-slate-800/70 backdrop-blur-sm border border-white/30 dark:border-slate-700/50 rounded-2xl p-6 shadow-lg h-fit"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Edit Symptoms</h3>
            <div className="space-y-4">
              <textarea
                value={editedTranscript}
                onChange={(e) => setEditedTranscript(e.target.value)}
                className="w-full bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-4 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-sm min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                placeholder="Edit your symptoms here..."
              />
              <button
                onClick={generatePrescription}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Pill className="w-4 h-4" />
                    Generate Prescription
                  </>
                )}
              </button>
            </div>
            
            {prescriptionData && (
              <div className="mt-4 p-4 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Generated</span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  {prescriptionData.generatedAt.toLocaleString()}
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column - Prescription */}
        <div className="lg:col-span-3">
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
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-lg">
                    <Pill className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Prescription Details</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">AI-generated recommendations</p>
                  </div>
                </div>
                
                {!loading && !error && prescriptionData && (
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
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-colors duration-200"
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
                      <Pill className="w-8 h-8 text-emerald-500 mx-auto mb-4 animate-pulse" />
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-400 absolute top-1 left-1/2 transform -translate-x-1/2" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">Analyzing symptoms...</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Generating personalized recommendations</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-xl p-6">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">Error Generating Prescription</h4>
                    <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
                    <button
                      onClick={generatePrescription}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : prescriptionData ? (
                <div className="space-y-6">
                  {/* Tab Navigation */}
                  <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                    {[
                      { id: 'overview', label: 'Overview', icon: <FileText className="w-4 h-4" /> },
                      { id: 'medications', label: 'Medications', icon: <Pill className="w-4 h-4" /> },
                      { id: 'symptoms', label: 'Symptoms', icon: <Activity className="w-4 h-4" /> },
                      { id: 'warnings', label: 'Warnings', icon: <Shield className="w-4 h-4" /> }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-emerald-500 text-white'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                      <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {/* Symptoms Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {prescriptionData.symptoms.map((symptom) => (
                            <div key={symptom.id} className="flex items-center gap-3 p-4 bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-700/50 rounded-xl">
                              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                {symptom.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-slate-900 dark:text-white">{symptom.name}</h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(symptom.severity)}`}>
                                    {symptom.severity}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{symptom.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Quick Recommendations */}
                        <div className="bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-4">
                          <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-3">Quick Recommendations</h4>
                          <div className="space-y-2">
                            {prescriptionData.recommendations.slice(0, 3).map((rec, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-blue-700 dark:text-blue-400">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Follow-up */}
                  <div className="bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 rounded-xl p-4">
                          <h4 className="font-medium text-amber-900 dark:text-amber-300 mb-2">Follow-up</h4>
                          <p className="text-sm text-amber-700 dark:text-amber-400">{prescriptionData.followUp}</p>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'medications' && (
                      <motion.div
                        key="medications"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        {prescriptionData.medications.map((medication) => (
                          <div key={medication.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-white/40 dark:bg-slate-800/40">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{medication.name}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{medication.genericName}</p>
                                <span className="inline-block px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full mt-2">
                                  {medication.category}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 mb-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span className="text-sm font-medium">4.8</span>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  medication.prescription 
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                }`}>
                                  {medication.prescription ? 'Prescription Required' : 'Over-the-Counter'}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <h5 className="font-medium text-slate-900 dark:text-white mb-1">Dosage</h5>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{medication.dosage}</p>
                              </div>
                              <div>
                                <h5 className="font-medium text-slate-900 dark:text-white mb-1">Frequency</h5>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{medication.frequency}</p>
                              </div>
                              <div>
                                <h5 className="font-medium text-slate-900 dark:text-white mb-1">Duration</h5>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{medication.duration}</p>
                              </div>
                            </div>

                            {medication.sideEffects.length > 0 && (
                              <div className="mb-4">
                                <h5 className="font-medium text-slate-900 dark:text-white mb-2">Common Side Effects</h5>
                                <div className="flex flex-wrap gap-2">
                                  {medication.sideEffects.map((effect, index) => (
                                    <span key={index} className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded-full">
                                      {effect}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {medication.warnings.length > 0 && (
                              <div>
                                <h5 className="font-medium text-slate-900 dark:text-white mb-2">Warnings</h5>
                                <div className="space-y-1">
                                  {medication.warnings.map((warning, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                      <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm text-amber-700 dark:text-amber-400">{warning}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {activeTab === 'symptoms' && (
                      <motion.div
                        key="symptoms"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        {prescriptionData.symptoms.map((symptom) => (
                          <div key={symptom.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-white/40 dark:bg-slate-800/40">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
                                {symptom.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{symptom.name}</h4>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(symptom.severity)}`}>
                                    {symptom.severity.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300">{symptom.description}</p>
                              </div>
                            </div>
                            
                            <div className="bg-slate-50/80 dark:bg-slate-900/60 rounded-lg p-4">
                              <h5 className="font-medium text-slate-900 dark:text-white mb-2">Recommendations for {symptom.name}</h5>
                              <div className="space-y-2">
                                {prescriptionData.recommendations.map((rec, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{rec}</span>
                                  </div>
                                ))}
                      </div>
                    </div>
                  </div>
                        ))}
                      </motion.div>
                    )}

                    {activeTab === 'warnings' && (
                      <motion.div
                        key="warnings"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {/* Emergency Signs */}
                        <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-xl p-6">
                          <h4 className="font-semibold text-red-900 dark:text-red-300 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Emergency Signs
                          </h4>
                          <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                            Seek immediate medical attention if you experience any of the following:
                          </p>
                          <div className="space-y-2">
                            {prescriptionData.emergencySigns.map((sign, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-sm text-red-700 dark:text-red-400">{sign}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Medical Disclaimer */}
                        <div className="bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 rounded-xl p-6">
                          <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Medical Disclaimer
                          </h4>
                          <div className="space-y-3 text-sm text-amber-700 dark:text-amber-400">
                            <p>
                              <strong>Important:</strong> This AI-generated prescription is for informational purposes only and should not replace professional medical advice.
                            </p>
                            <p>
                              <strong>Consultation Required:</strong> Please consult with a qualified healthcare provider before taking any medications, especially if you have:
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                              <li>Existing medical conditions</li>
                              <li>Allergies to medications</li>
                              <li>Are pregnant or breastfeeding</li>
                              <li>Are taking other medications</li>
                            </ul>
                            <p>
                              <strong>Side Effects:</strong> All medications can cause side effects. Monitor your response and contact your healthcare provider if you experience any adverse reactions.
                            </p>
                          </div>
                        </div>

                        {/* Booking Appointment Section */}
                        <div className="mt-8">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Book an Appointment</h3>
                          <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/20 p-6">
                            <BookingPage transcript={editedTranscript} onBack={() => {}} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PrescriptionPage;
