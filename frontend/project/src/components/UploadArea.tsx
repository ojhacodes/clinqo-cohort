import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Mic, FileAudio, X, Loader2 } from 'lucide-react';

interface UploadAreaProps {
  onFileUpload: (file: File) => void;
  isProcessing?: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFileUpload, isProcessing = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => file.type.startsWith('audio/'));
    
    if (audioFile) {
      setSelectedFile(audioFile);
    } else {
      alert('Please upload an audio file (MP3, WAV, M4A, etc.)');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
    } else if (file) {
      alert('Please select an audio file (MP3, WAV, M4A, etc.)');
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="space-y-6"
    >
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/20 scale-105'
            : 'border-slate-300 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10'
        } bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />

        <div className="space-y-6">
          {/* Upload Icon */}
          <motion.div
            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
            className="flex justify-center"
          >
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 rounded-2xl shadow-lg">
              <Upload className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Upload Text */}
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
              {isDragging ? 'Drop your audio file here' : 'Upload Audio File'}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Drag and drop your audio file or click to browse
            </p>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              <FileAudio className="w-5 h-5" />
              Choose File
            </button>
          </div>

          {/* Supported Formats */}
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span>Supported formats:</span>
            <div className="flex gap-2">
              {['MP3', 'WAV', 'M4A', 'WEBM'].map((format) => (
                <span
                  key={format}
                  className="bg-slate-100/80 dark:bg-slate-700/80 px-2 py-1 rounded-md text-xs font-medium"
                >
                  {format}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected File */}
      {selectedFile && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/60 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-xl">
                <Mic className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{selectedFile.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            {!isProcessing && (
              <button
                onClick={handleRemoveFile}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg hover:shadow-blue-500/40"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Audio...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Process Audio
              </>
            )}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default UploadArea;