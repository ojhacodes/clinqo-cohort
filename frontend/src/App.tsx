import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_TRANSCRIPT = `Patient complains of severe headache for the past 3 days, accompanied by nausea and sensitivity to light. Pain is described as throbbing and located on the right side of the head. Patient is a 34-year-old female with no significant medical history.`;
const MOCK_PRESCRIPTION = `# Medical Assessment & Prescription\n\n## Patient Information\n- **Age:** 34 years\n- **Gender:** Female\n- **Chief Complaint:** Severe headache (3 days duration)\n\n## Clinical Findings\n- Unilateral throbbing headache (right-sided)\n- Associated nausea and photophobia\n- No significant past medical history\n\n## Differential Diagnosis\n1. **Primary:** Migraine without aura\n2. Secondary headache (less likely given presentation)\n\n## Treatment Plan\n\n### Acute Management\n**Sumatriptan 50mg**\n- Take 1 tablet at onset of headache\n- May repeat after 2 hours if needed\n- Maximum 2 tablets per 24 hours\n\n**Ibuprofen 400mg**\n- Take with food every 6-8 hours as needed\n- Maximum 1200mg per day\n\n### Supportive Care\n- Rest in dark, quiet environment\n- Cold compress to head/neck\n- Adequate hydration\n- Avoid known triggers\n\n### Follow-up\n- Return if symptoms worsen or persist >7 days\n- Consider neurology referral if recurrent\n- Headache diary recommended\n\n### Red Flags to Monitor\n- Sudden severe headache ("thunderclap")\n- Fever with headache\n- Vision changes\n- Neck stiffness\n\n**Provider:** Dr. AI Assistant, MD\n**Date:** 2024-05-01\n**License:** AI-001-2024`;

export default function App() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [prescription, setPrescription] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState('');
  const [fullAIResponse, setFullAIResponse] = useState('');

  // Simulate transcribing progress
  const handleTranscribe = () => {
    setIsTranscribing(true);
    setProgress(0);
    setShowResult(false);
    setTranscript('');
    setEditedTranscript('');
    let percent = 0;
    const interval = setInterval(() => {
      percent += Math.floor(Math.random() * 20) + 10;
      if (percent >= 100) {
        percent = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsTranscribing(false);
          setTranscript(MOCK_TRANSCRIPT);
          setEditedTranscript(MOCK_TRANSCRIPT);
          setShowResult(true);
        }, 500);
      }
      setProgress(percent);
    }, 400);
  };

  const handleGeneratePrescription = () => {
    setPrescription(MOCK_PRESCRIPTION);
  };

  const handleAIPrescription = async () => {
    setPrescription('');
    setAssessmentResult(null);
    setFullAIResponse('');
    try {
      const response = await fetch('http://localhost:8000/prescription/ai-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: editedTranscript }),
      });
      const data = await response.json();
      setAssessmentResult(data);
      // Combine diagnosis and prescription into a single string for display/copy
      const combined = JSON.stringify(data, null, 2);
      setFullAIResponse(combined);
      setPrescription(
        typeof data.prescription === 'object'
          ? JSON.stringify(data.prescription, null, 2)
          : data.prescription || ''
      );
    } catch (err) {
      setFullAIResponse('Error generating prescription.');
    }
  };

  const handleCopy = () => {
    if (prescription) {
      navigator.clipboard.writeText(prescription);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-100 to-indigo-100 flex flex-col items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-2xl bg-white/80 shadow-xl rounded-3xl p-8 backdrop-blur-md">
        <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">AI Medical Assistant</h1>
        <p className="text-center text-slate-600 mb-8">Transcribe, get AI-powered prescriptions, and book appointments seamlessly.</p>
        {/* Transcribe Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2 text-slate-800">1. Transcribe Audio</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input type="file" accept="audio/*" className="block w-full sm:w-auto" disabled={isTranscribing} />
            <button onClick={handleTranscribe} disabled={isTranscribing} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-lg font-semibold shadow hover:scale-105 transition-transform duration-200">
              {isTranscribing ? 'Transcribing...' : 'Transcribe'}
            </button>
          </div>
        </div>
        {/* Progress Modal */}
        <AnimatePresence>
          {isTranscribing && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center min-w-[300px]">
                <div className="w-16 h-16 mb-4 relative">
                  <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 36 36">
                    <path className="text-blue-200" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32z" />
                    <motion.path className="text-blue-600" strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32z" strokeDasharray="100" strokeDashoffset={100 - progress} initial={false} animate={{ strokeDashoffset: 100 - progress }} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-blue-700">{progress}%</span>
                </div>
                <p className="text-slate-700 font-medium">Transcribing audio...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Editable Transcribed Text Result */}
        {showResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-slate-800">Transcribed Text</h3>
            <textarea
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 font-mono whitespace-pre-wrap shadow-inner w-full min-h-[100px] mb-4"
              value={editedTranscript}
              onChange={e => setEditedTranscript(e.target.value)}
              placeholder="Edit the transcribed text here..."
            />
          </motion.div>
        )}
        {/* AI Prescription Button */}
        {showResult && (
          <div className="mb-8">
            <button
              onClick={handleAIPrescription}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg font-semibold shadow hover:scale-105 transition-transform duration-200 mb-4"
            >
              AI Prescription
            </button>
          </div>
        )}
        {/* Combined AI Assessment Result Box with Copy and Book Appointment */}
        {fullAIResponse && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 font-mono whitespace-pre-wrap shadow-inner mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">AI Prescription Result</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(fullAIResponse);
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2000);
                }}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded transition-all text-sm font-medium"
              >
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-xs">{fullAIResponse}</pre>
            <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white px-6 py-2 rounded-lg font-semibold shadow hover:scale-105 transition-transform duration-200">
              Book Appointment
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 