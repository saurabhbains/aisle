'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VoiceInput from '@/components/VoiceInput';

export default function DashboardPage() {
  const router = useRouter();
  const [criteria, setCriteria] = useState<any>(null);
  const [transcription, setTranscription] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [coupleName, setCoupleName] = useState('');

  const handleCriteriaExtracted = async (extractedCriteria: any, text: string) => {
    setCriteria(extractedCriteria);
    setTranscription(text);

    // Automatically start searching for venues
    setIsSearching(true);

    try {
      // Navigate to venues page with criteria
      const params = new URLSearchParams();
      params.set('criteria', JSON.stringify(extractedCriteria));
      params.set('autoSearch', 'true');

      router.push(`/venues?${params.toString()}`);
    } catch (error) {
      console.error('Navigation error:', error);
      setIsSearching(false);
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
            AI-Powered Wedding Venue Discovery
          </p>
          <p className="text-gray-500 mt-2">
            Just tell us what you're looking for, we'll find the perfect venues
          </p>
        </div>

        {/* Couple Name Input */}
        <div className="max-w-2xl mx-auto mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Names (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g., Sarah & John"
            value={coupleName}
            onChange={(e) => setCoupleName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        {/* Voice Input */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-pink-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3 text-lg">
              1
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Tell Us What You're Looking For</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Speak or type your wedding criteria (location, date, guest count, budget, style preferences, etc.)
          </p>
          <VoiceInput onCriteriaExtracted={handleCriteriaExtracted} />
        </div>

        {/* Show Extracted Criteria */}
        {criteria && !isSearching && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-lg font-bold text-green-900 mb-3">✅ Criteria Captured!</h3>
              <p className="text-sm text-gray-600 mb-3"><strong>You said:</strong> "{transcription}"</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {criteria.hardCriteria?.location && (
                  <div>
                    <span className="text-sm text-gray-600">Location:</span>
                    <p className="font-semibold">{criteria.hardCriteria.location}</p>
                  </div>
                )}
                {criteria.hardCriteria?.guestCount && (
                  <div>
                    <span className="text-sm text-gray-600">Guests:</span>
                    <p className="font-semibold">{criteria.hardCriteria.guestCount}</p>
                  </div>
                )}
                {criteria.hardCriteria?.budget && (
                  <div>
                    <span className="text-sm text-gray-600">Budget:</span>
                    <p className="font-semibold">£{criteria.hardCriteria.budget?.toLocaleString()}</p>
                  </div>
                )}
                {criteria.softCriteria?.aestheticPreference && (
                  <div>
                    <span className="text-sm text-gray-600">Style:</span>
                    <p className="font-semibold">{criteria.softCriteria.aestheticPreference}</p>
                  </div>
                )}
              </div>

              <p className="text-sm text-green-800 mt-3">
                🎉 Redirecting to venue search...
              </p>
            </div>
          </div>
        )}

        {isSearching && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-blue-50 p-8 rounded-lg border border-blue-200 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">Scraping the web for venues...</h3>
              <p className="text-blue-800">Finding the best wedding venues matching your criteria</p>
            </div>
          </div>
        )}

        {/* How It Works */}
        {!criteria && (
          <div className="max-w-4xl mx-auto mt-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-pink-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-2xl">🎤</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">1. Speak Your Criteria</h3>
                <p className="text-gray-600 text-sm">
                  Tell us your wedding date, location, budget, guest count, and style preferences
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">2. AI Finds Venues</h3>
                <p className="text-gray-600 text-sm">
                  We scrape the web for real venues, extract emails, pricing, and details
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-2xl">📧</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">3. Send Inquiries</h3>
                <p className="text-gray-600 text-sm">
                  Review AI-generated emails and send to multiple venues with one click
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
