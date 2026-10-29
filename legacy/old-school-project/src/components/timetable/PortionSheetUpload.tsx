'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, File, Image, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  extractedText?: string;
  processedAt?: Date;
}

interface PortionSheetUploadProps {
  onFileProcessed: (file: UploadedFile) => void;
  onError: (error: string) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export function PortionSheetUpload({ onFileProcessed, onError }: PortionSheetUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'extracting' | 'analyzing' | 'complete' | 'error'>('idle');

  const validateFile = (file: File): boolean => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      onError('Invalid file type. Please upload PDF or image files.');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      onError('File size too large. Maximum size is 10MB.');
      return false;
    }

    return true;
  };

  const getFileIcon = (type: string) => {
    if (type === 'application/pdf') return FileText;
    if (type.startsWith('image/')) return Image;
    return File;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const processFile = async (file: File): Promise<void> => {
    setIsUploading(true);
    setProcessingStatus('extracting');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Call the Python backend for extraction
      const extractResponse = await fetch('http://127.0.0.1:8000/api/timetable/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!extractResponse.ok) {
        throw new Error('Failed to extract text from file');
      }

      const { text: extractedText } = await extractResponse.json();
      setProcessingStatus('analyzing');

      // Parse syllabus using AI (calling the same Python chat endpoint or a specific parse one)
      // For now, let's use the chat endpoint to "analyze" this text
      const parseResponse = await fetch('http://127.0.0.1:8000/api/timetable/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Please analyze this portion sheet text and return a structured syllabus in JSON format: ${extractedText}`
        })
      });

      let parseResult = null;
      if (parseResponse.ok) {
        const chatData = await parseResponse.json();
        // Here we'd expect the AI to return a structured syllabus. 
        // For now, let's adapt to what the frontend expects.
        parseResult = chatData.timetable || {
          subjects: [
            {
              name: 'Analyzed Content',
              chapters: [
                { name: 'Extracted Syllabus', difficulty: 'Medium', estimatedHours: 10 }
              ]
            }
          ],
          totalSubjects: 1
        };
      } else {
        throw new Error('Failed to analyze syllabus');
      }

      const processedFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        extractedText: extractedText,
        processedAt: new Date()
      };

      setUploadedFile(processedFile);
      setProcessingStatus('complete');
      onFileProcessed({ ...processedFile, ...parseResult });

    } catch (error) {
      console.error('Error processing file:', error);
      setProcessingStatus('error');
      onError(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        processFile(file);
      }
    }
  }, [onFileProcessed, onError]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        processFile(file);
      }
    }
  }, [onFileProcessed, onError]);

  const removeFile = () => {
    setUploadedFile(null);
    setProcessingStatus('idle');
  };

  const getStatusMessage = () => {
    switch (processingStatus) {
      case 'extracting':
        return 'Extracting text from your portion sheet...';
      case 'analyzing':
        return 'Analyzing syllabus and identifying topics...';
      case 'complete':
        return 'Portion sheet processed successfully!';
      case 'error':
        return 'Processing failed. Please try again.';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (processingStatus) {
      case 'extracting':
      case 'analyzing':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="portion-sheet-upload">
      {!uploadedFile ? (
        <div
          className={`upload-area ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            id="file-upload"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />

          <div className="upload-content">
            <Upload className={`w-12 h-12 ${isUploading ? 'text-blue-500' : 'text-gray-400'}`} />
            <h3 className="upload-title">
              {isUploading ? 'Processing File...' : 'Upload Your Portion Sheet'}
            </h3>
            <p className="upload-description">
              Drag and drop your PDF or image file here, or click to browse
            </p>
            <p className="upload-formats">
              Supported formats: PDF, JPG, PNG, WebP (Max 10MB)
            </p>

            {!isUploading && (
              <label htmlFor="file-upload" className="upload-button">
                Select File
              </label>
            )}
          </div>

          {isUploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="progress-status">
                {getStatusIcon()}
                <span className="ml-2">{getStatusMessage()}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="uploaded-file">
          <div className="file-info">
            <div className="file-icon">
              {React.createElement(getFileIcon(uploadedFile.type), { className: 'w-8 h-8' })}
            </div>
            <div className="file-details">
              <h4 className="file-name">{uploadedFile.name}</h4>
              <p className="file-meta">
                {formatFileSize(uploadedFile.size)} •
                {uploadedFile.processedAt && ` Processed ${uploadedFile.processedAt.toLocaleTimeString()}`}
              </p>
            </div>
            <button
              onClick={removeFile}
              className="remove-file"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {processingStatus === 'complete' && (
            <div className="file-success">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-700">
                Portion sheet processed successfully! Your timetable will be generated based on this.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}