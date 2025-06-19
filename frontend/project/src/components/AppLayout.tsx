import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic, Upload as UploadIcon } from 'lucide-react';
import UploadArea from './UploadArea';
import VoiceRecorder from './VoiceRecorder';
import TranscriptionPanel from './TranscriptionPanel';
import ActionButtons from './ActionButtons';
import PrescriptionPage from './PrescriptionPage';
import DiagnosisPage from './DiagnosisPage';
import SlotBookingPage from './SlotBookingPage';

interface AppLayoutProps {
  onBackToHome: () => void;
}

interface TranscriptionData {
  transcript: string;
  audioBlob?: Blob;
  audioURL?: string;
}

type CurrentPage = 'input' | 'prescription' | 'diagnosis' | 'booking';

const AppLayout: React.FC<AppLayoutProps> = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'record'>('record');
  const [transcriptionData, setTranscriptionData] = useState<TranscriptionData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState<CurrentPage>('input');

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    
    const formData = new FormData();
    formData.append('audio', file);
    
    try {
      const response = await fetch('http://localhost:8000/voice/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        setTranscriptionData({
          transcript: data.transcript || 'No transcript available'
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Error uploading file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranscriptionComplete = (data: TranscriptionData) => {
    setTranscriptionData(data);
  };

  const handleRetry = () => {
    setTranscriptionData(null);
    setCurrentPage('input');
  };

  const handlePageChange = (page: CurrentPage) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'prescription':
        return (
          <PrescriptionPage 
            transcript={transcriptionData?.transcript || ''} 
            onBack={() => setCurrentPage('input')}
          />
        );
      case 'diagnosis':
        return (
          <DiagnosisPage 
            transcript={transcriptionData?.transcript || ''} 
            onBack={() => setCurrentPage('input')}
          />
        );
      case 'booking':
        return (
          <SlotBookingPage 
            transcript={transcriptionData?.transcript || ''} 
            onBack={() => setCurrentPage('input')}
          />
        );
      default:
        return renderInputPage();
    }
  };

  const renderInputPage = () => (
    <div className="max-w-7xl mx-auto">
      {!transcriptionData ? (
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8 mt-8"
          >
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Share Your Symptoms
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Record your voice or upload an audio file for AI medical analysis
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mb-8"
          >
            <div className="bg-white/60 dark:bg-slate-800/70 backdrop-blur-sm border border-white/30 dark:border-slate-700/50 rounded-2xl p-2 shadow-lg">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('record')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === 'record'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  Record Audio
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === 'upload'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <UploadIcon className="w-4 h-4" />
                  Upload File
                </button>
              </div>
            </div>
          </motion.div>

          {/* Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {activeTab === 'record' ? (
              <VoiceRecorder onTranscriptionComplete={handleTranscriptionComplete} />
            ) : (
              <UploadArea onFileUpload={handleFileUpload} isProcessing={isProcessing} />
            )}
            
            {/* Info Panel */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/60 dark:bg-slate-800/70 backdrop-blur-sm border border-white/30 dark:border-slate-700/50 rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                How It Works
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Record or Upload</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Describe your symptoms clearly in your own words
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">AI Transcription</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Your audio is converted to text with high accuracy
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Choose Action</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Get prescription, diagnosis, or book appointment
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Transcription */}
          <div className="lg:col-span-1">
            <TranscriptionPanel 
              transcriptionData={transcriptionData}
              onRetry={handleRetry}
            />
          </div>

          {/* Right Column - Action Buttons */}
          <div className="lg:col-span-2">
            <ActionButtons onPageChange={handlePageChange} />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen relative z-10 dark:bg-slate-900"
    >
      {/* Header */}
      <div className="px-6 sm:px-8 py-6 bg-white/40 dark:bg-slate-900/60 backdrop-blur-md border-b border-white/30 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl shadow-md flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {currentPage === 'input' ? 'Clinqo Dashboard' : 
               currentPage === 'prescription' ? 'Prescription Generator' :
               currentPage === 'diagnosis' ? 'AI Diagnosis' : 'Slot Booking'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-8 pb-8">
        {renderCurrentPage()}
      </div>
    </motion.div>
  );
};

export default AppLayout;