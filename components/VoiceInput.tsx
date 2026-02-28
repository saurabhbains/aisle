'use client';

import { useState, useRef } from 'react';

interface VoiceInputProps {
  onCriteriaExtracted: (criteria: any, transcription: string) => void;
}

export default function VoiceInput({ onCriteriaExtracted }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe-voice', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onCriteriaExtracted(data.criteria, data.transcription);
      } else {
        alert('Failed to process audio: ' + data.error);
      }
    } catch (error) {
      console.error('Processing error:', error);
      alert('Failed to process recording');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Tell Us About Your Wedding</h2>
      <p className="text-gray-600 mb-6">
        Click record and speak naturally about your wedding plans. Mention your date, location, guest count, budget, and any special requirements.
      </p>

      <div className="flex flex-col items-center space-y-4">
        {!isRecording && !isProcessing && (
          <button
            onClick={startRecording}
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105"
          >
            🎤 Start Recording
          </button>
        )}

        {isRecording && (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-semibold text-red-500">Recording...</span>
            </div>
            <button
              onClick={stopRecording}
              className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-full text-lg transition-all"
            >
              ⏹ Stop Recording
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            <p className="text-gray-600 font-semibold">Processing your recording...</p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Example:</strong> "We want to get married in July 2025 in Brighton, around 100 guests, budget £15,000. We need on-site accommodation and outdoor space for the ceremony."
        </p>
      </div>
    </div>
  );
}
