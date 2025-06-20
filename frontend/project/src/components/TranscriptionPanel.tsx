import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Copy, CheckCircle, RotateCcw, Play, Pause, Volume2 } from 'lucide-react';

interface TranscriptionData {
  transcript: string;
  audioBlob?: Blob;
  audioURL?: string;
}

interface TranscriptionPanelProps {
  transcriptionData: TranscriptionData;
  onRetry: () => void;
}

const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({ 
  transcriptionData, 
  onRetry 
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState(transcriptionData.transcript);

  // Update edited transcript when transcriptionData changes
  React.useEffect(() => {
    setEditedTranscript(transcriptionData.transcript);
  }, [transcriptionData.transcript]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedTranscript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const togglePlayback = () => {
    if (transcriptionData.audioURL) {
      const audio = new Audio(transcriptionData.audioURL);
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
        audio.onended = () => setIsPlaying(false);
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="bg-white/60 dark:bg-slate-800/70 backdrop-blur-sm border border-white/30 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-lg h-fit"
    >
      {/* Header */}
      <div className="border-b border-white/20 dark:border-slate-700/50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Transcription</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Your audio converted to text</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {transcriptionData.audioURL && (
              <button
                onClick={togglePlayback}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg transition-colors duration-200"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span className="text-sm">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span className="text-sm">Play</span>
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors duration-200"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-300" />
                  <span className="text-sm">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-6 max-h-80 overflow-y-auto">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg flex-shrink-0">
              <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">Transcribed Text</h4>
              <textarea
                value={editedTranscript}
                onChange={(e) => setEditedTranscript(e.target.value)}
                className="w-full min-h-[120px] p-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-600/50 rounded-lg text-slate-700 dark:text-slate-300 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 dark:focus:ring-blue-400/50 dark:focus:border-blue-400 transition-all duration-200 shadow-sm focus:shadow-md"
                placeholder="Edit the transcribed text here..."
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-6 border-t border-white/20 dark:border-slate-700/50 mt-6">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-2 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4" />
            Record Again
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TranscriptionPanel;