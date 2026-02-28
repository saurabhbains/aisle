'use client';

import { useState } from 'react';
import VoiceInput from '@/components/VoiceInput';
import PDFUpload from '@/components/PDFUpload';
import VenueCard from '@/components/VenueCard';
import EmailPreview from '@/components/EmailPreview';

export default function DashboardPage() {
  const [criteria, setCriteria] = useState<any>(null);
  const [transcription, setTranscription] = useState('');
  const [venueInfo, setVenueInfo] = useState<any>(null);
  const [emailContent, setEmailContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [coupleName, setCoupleName] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

  const handleCriteriaExtracted = (extractedCriteria: any, text: string) => {
    setCriteria(extractedCriteria);
    setTranscription(text);
  };

  const handleVenueExtracted = (extracted: any) => {
    setVenueInfo(extracted);
  };

  const handleGenerateEmail = async () => {
    if (!venueInfo || !criteria) {
      alert('Please add both your criteria and venue information first');
      return;
    }

    setIsGeneratingEmail(true);
    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueName: venueInfo.venueName,
          venueInfo,
          criteria,
          coupleName: coupleName || 'Prospective Couple',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEmailContent(data.emailContent);
        setEmailSubject(data.subject);
      } else {
        alert('Failed to generate email: ' + data.error);
      }
    } catch (error) {
      console.error('Email generation error:', error);
      alert('Failed to generate email');
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleSendEmail = async (to: string, subject: string, body: string) => {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, emailBody: body }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            💍 Aisle
          </h1>
          <p className="text-xl text-gray-600">
            AI-Powered Wedding Planning Assistant
          </p>
          <p className="text-gray-500 mt-2">
            Find your perfect venue in minutes, not months
          </p>
        </div>

        {/* Couple Name Input */}
        <div className="max-w-2xl mx-auto mb-8">
          <input
            type="text"
            placeholder="Enter your names (e.g., Sarah & John)"
            value={coupleName}
            onChange={(e) => setCoupleName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        {/* Step 1: Voice Input */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
              1
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Record Your Criteria</h2>
          </div>
          <VoiceInput onCriteriaExtracted={handleCriteriaExtracted} />
        </div>

        {/* Show Extracted Criteria */}
        {criteria && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-bold text-green-900 mb-3">✅ Criteria Captured!</h3>
              <p className="text-sm text-gray-600 mb-3"><strong>You said:</strong> "{transcription}"</p>
              <div className="grid grid-cols-2 gap-3">
                {criteria.date && (
                  <div>
                    <span className="text-sm text-gray-600">Date:</span>
                    <p className="font-semibold">{criteria.date}</p>
                  </div>
                )}
                {criteria.location && (
                  <div>
                    <span className="text-sm text-gray-600">Location:</span>
                    <p className="font-semibold">{criteria.location}</p>
                  </div>
                )}
                {criteria.guestCount && (
                  <div>
                    <span className="text-sm text-gray-600">Guests:</span>
                    <p className="font-semibold">{criteria.guestCount}</p>
                  </div>
                )}
                {criteria.budget && (
                  <div>
                    <span className="text-sm text-gray-600">Budget:</span>
                    <p className="font-semibold">£{criteria.budget}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: PDF Upload */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
              2
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Upload Venue Brochure</h2>
          </div>
          <PDFUpload onVenueExtracted={handleVenueExtracted} />
        </div>

        {/* Show Venue Info */}
        {venueInfo && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center mb-4">
              <div className="bg-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                3
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Venue Details</h2>
            </div>
            <VenueCard
              venueInfo={venueInfo}
              onGenerateEmail={handleGenerateEmail}
            />
          </div>
        )}

        {/* Generate Email Button */}
        {venueInfo && criteria && !emailContent && (
          <div className="max-w-2xl mx-auto mb-8 text-center">
            <button
              onClick={handleGenerateEmail}
              disabled={isGeneratingEmail}
              className={`text-white font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 ${
                isGeneratingEmail
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isGeneratingEmail ? '✨ Generating Email...' : '✨ Generate Personalized Email'}
            </button>
          </div>
        )}

        {/* Show Email Preview */}
        {emailContent && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center mb-4">
              <div className="bg-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                4
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Send Email</h2>
            </div>
            <EmailPreview
              subject={emailSubject}
              emailBody={emailContent}
              venueName={venueInfo?.venueName || 'Venue'}
              onSend={handleSendEmail}
              onEdit={(newBody) => setEmailContent(newBody)}
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pb-8">
          <p className="text-gray-500 text-sm">
            Built with ❤️ for couples planning their perfect day
          </p>
        </div>
      </div>
    </div>
  );
}
