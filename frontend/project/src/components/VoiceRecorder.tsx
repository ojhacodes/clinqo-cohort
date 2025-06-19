import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Upload, Loader2, Play, Pause, RotateCcw } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptionComplete: (data: {
    transcript: string;
    audioBlob?: Blob;
    audioURL?: string;
  }) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptionComplete }) => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(1000);
      setRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    
    try {
      const response = await fetch('http://localhost:8000/voice/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        onTranscriptionComplete({
          transcript: data.transcript || 'No transcript available',
          audioBlob,
          audioURL
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert(`Error uploading audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const resetRecording = () => {
    setAudioURL(null);
    setAudioBlob(null);
    setRecordingTime(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-white/60 dark:bg-slate-800/70 backdrop-blur-sm border border-white/30 dark:border-slate-700/50 rounded-2xl p-8 shadow-lg"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 px-4 py-2 rounded-full mb-4">
          <Mic className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-blue-700 dark:text-blue-300 font-medium">Voice Recorder</span>
        </div>
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
          Record Your Symptoms
        </h3>
        <p className="text-slate-600 dark:text-slate-300">
          Speak clearly about your symptoms for accurate transcription
        </p>
      </div>

      <div className="flex flex-col items-center gap-8">
        {/* Recording Visualization */}
        <div className="relative">
          <motion.div
            animate={recording ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 2, repeat: recording ? Infinity : 0 }}
            className={`w-32 h-32 rounded-full flex items-center justify-center ${
              recording 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/30' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30'
            } transition-all duration-300`}
          >
            {recording ? (
              <Square className="w-12 h-12 text-white" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </motion.div>
          
          {recording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
            >
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 dark:border-slate-700/50 shadow-lg">
                <span className="font-mono text-lg font-semibold text-slate-900 dark:text-white">
                  {formatTime(recordingTime)}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex flex-col items-center gap-4">
          {!recording && !audioURL && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/40"
            >
              <Mic className="w-5 h-5" />
              Start Recording
            </motion.button>
          )}

          {recording && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopRecording}
              className="flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/40"
            >
              <Square className="w-5 h-5" />
              Stop Recording
            </motion.button>
          )}
        </div>

        {/* Audio Playback */}
        {audioURL && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md space-y-6"
          >
            {/* Audio Player Card */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/60 dark:to-slate-800/60 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                    <Mic className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Recording Complete</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{formatTime(recordingTime)}</p>
                  </div>
                </div>
                
                <button
                  onClick={togglePlayback}
                  className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  ) : (
                    <Play className="w-5 h-5 text-slate-600 dark:text-slate-300 ml-0.5" />
                  )}
                </button>
              </div>
              
              <audio
                ref={audioRef}
                src={audioURL}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-8 rounded-lg"
                controls
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={resetRecording}
                className="flex items-center justify-center gap-2 flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              
              <button
                onClick={uploadAudio}
                disabled={uploading}
                className="flex items-center justify-center gap-2 flex-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:shadow-green-500/40 transform hover:scale-[1.02]"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Get Transcription
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Recording Tips */}
        {!audioURL && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="max-w-md text-center"
          >
            <div className="bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Recording Tips</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>• Speak clearly and at normal pace</li>
                <li>• Describe symptoms in detail</li>
                <li>• Mention duration and severity</li>
                <li>• Include any relevant medical history</li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default VoiceRecorder;