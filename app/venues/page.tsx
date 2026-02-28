'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MatchResult } from '@/lib/venue-matcher';

export const dynamic = 'force-dynamic';

export default function VenuesPage() {
  const searchParams = useSearchParams();
  const [matchedVenues, setMatchedVenues] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [criteria, setCriteria] = useState({
    hardCriteria: {
      location: '',
      guestCount: '',
      budget: '',
      needsAccommodation: false,
      cateringPreference: '',
    },
    softCriteria: {
      needsOutdoorSpace: false,
      aestheticPreference: '',
      preferredAmenities: [] as string[],
    },
  });
  const [selectedVenues, setSelectedVenues] = useState<Set<string>>(new Set());
  const [generatedEmails, setGeneratedEmails] = useState<any[]>([]);
  const [showEmailReview, setShowEmailReview] = useState(false);
  const [generatingEmails, setGeneratingEmails] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [selectedVenueDetails, setSelectedVenueDetails] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [demoMode, setDemoMode] = useState(true); // Demo mode enabled by default

  // Auto-load criteria from URL and search
  useEffect(() => {
    const criteriaParam = searchParams.get('criteria');
    const autoSearch = searchParams.get('autoSearch');

    if (criteriaParam) {
      try {
        const parsedCriteria = JSON.parse(criteriaParam);

        // Convert to form format
        const formCriteria = {
          hardCriteria: {
            location: parsedCriteria.hardCriteria?.location || '',
            guestCount: parsedCriteria.hardCriteria?.guestCount?.toString() || '',
            budget: parsedCriteria.hardCriteria?.budget?.toString() || '',
            needsAccommodation: parsedCriteria.hardCriteria?.needsAccommodation || false,
            cateringPreference: parsedCriteria.hardCriteria?.cateringPreference || '',
          },
          softCriteria: {
            needsOutdoorSpace: parsedCriteria.softCriteria?.needsOutdoorSpace || false,
            aestheticPreference: parsedCriteria.softCriteria?.aestheticPreference || '',
            preferredAmenities: parsedCriteria.softCriteria?.preferredAmenities || [],
          },
        };

        setCriteria(formCriteria);

        // Auto-trigger search if specified
        if (autoSearch === 'true') {
          setTimeout(() => handleSearch(parsedCriteria), 500);
        }
      } catch (error) {
        console.error('Failed to parse criteria from URL:', error);
      }
    }
  }, [searchParams]);

  const handleSearch = async (providedCriteria?: any) => {
    console.log('Search triggered!');
    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      // Use provided criteria or convert form values
      const searchCriteria = providedCriteria || {
        hardCriteria: {
          ...(criteria.hardCriteria.location && { location: criteria.hardCriteria.location }),
          ...(criteria.hardCriteria.guestCount && { guestCount: parseInt(criteria.hardCriteria.guestCount) }),
          ...(criteria.hardCriteria.budget && { budget: parseInt(criteria.hardCriteria.budget) }),
          ...(criteria.hardCriteria.needsAccommodation && { needsAccommodation: true }),
          ...(criteria.hardCriteria.cateringPreference && { cateringPreference: criteria.hardCriteria.cateringPreference }),
        },
        softCriteria: {
          ...(criteria.softCriteria.needsOutdoorSpace && { needsOutdoorSpace: true }),
          ...(criteria.softCriteria.aestheticPreference && { aestheticPreference: criteria.softCriteria.aestheticPreference }),
          ...(criteria.softCriteria.preferredAmenities.length > 0 && { preferredAmenities: criteria.softCriteria.preferredAmenities }),
        },
      };

      console.log('Scraping venues with criteria:', searchCriteria);

      // First, scrape venues from the web
      const scrapeResponse = await fetch('/api/scrape-venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria: searchCriteria }),
      });

      const scrapeData = await scrapeResponse.json();
      console.log('Scrape Response:', scrapeData);

      if (!scrapeData.success) {
        setError(scrapeData.error || 'Failed to scrape venues');
        setLoading(false);
        return;
      }

      // Then, match and rank the scraped venues
      const matchResponse = await fetch('/api/match-venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          criteria: searchCriteria,
          venues: scrapeData.venues
        }),
      });

      const matchData = await matchResponse.json();
      console.log('Match Response:', matchData);

      if (matchData.success) {
        console.log(`Found ${matchData.results.length} matching venues`);
        setMatchedVenues(matchData.results);
      } else {
        setError(matchData.error || 'Failed to match venues');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search venues');
    } finally {
      setLoading(false);
    }
  };

  const toggleVenueSelection = (venueId: string) => {
    const newSelected = new Set(selectedVenues);
    if (newSelected.has(venueId)) {
      newSelected.delete(venueId);
    } else {
      newSelected.add(venueId);
    }
    setSelectedVenues(newSelected);
  };

  const selectAll = () => {
    setSelectedVenues(new Set(matchedVenues.map(m => m.venue.id)));
  };

  const deselectAll = () => {
    setSelectedVenues(new Set());
  };

  const handleGenerateEmails = async () => {
    setGeneratingEmails(true);

    try {
      // Get the selected venue data
      const selectedVenueData = matchedVenues.filter(m =>
        selectedVenues.has(m.venue.id)
      );

      console.log(`Generating emails for ${selectedVenueData.length} venues...`);

      const response = await fetch('/api/generate-batch-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venues: selectedVenueData,
          criteria: criteria,
          coupleName: 'Sarah & John' // TODO: Get from user input
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log(`Successfully generated ${data.successful} emails`);
        setGeneratedEmails(data.emails);
        setShowEmailReview(true);
      } else {
        alert('Failed to generate emails: ' + data.error);
      }
    } catch (error: any) {
      console.error('Email generation error:', error);
      alert('Failed to generate emails');
    } finally {
      setGeneratingEmails(false);
    }
  };

  const handleSendBatchEmails = async () => {
    setSendingEmails(true);

    try {
      console.log(`Sending ${generatedEmails.filter(e => e.success).length} emails...`);

      const response = await fetch('/api/send-batch-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: generatedEmails,
          demoMode: demoMode
        })
      });

      const data = await response.json();

      if (data.success) {
        const demoMessage = demoMode
          ? `\n\n🎬 DEMO MODE: All emails were sent to saurabhbains@berkeley.edu instead of real venues.`
          : '';
        alert(`Successfully sent ${data.sent} emails! ${data.failed > 0 ? `(${data.failed} failed)` : ''}${demoMessage}`);
        setShowEmailReview(false);
        setGeneratedEmails([]);
        setSelectedVenues(new Set());
        // Refresh the search to show updated statuses
        handleSearch();
      } else {
        alert('Failed to send emails: ' + data.error);
      }
    } catch (error: any) {
      console.error('Email sending error:', error);
      alert('Failed to send emails');
    } finally {
      setSendingEmails(false);
    }
  };

  const handleSimulateResponse = async (venueId: string) => {
    try {
      const response = await fetch('/api/simulate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venueId })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Simulated response from venue! They've sent back their brochure with pricing and availability.`);
        // Refresh the search to show updated status
        handleSearch();
      } else {
        alert('Failed to simulate response: ' + data.error);
      }
    } catch (error: any) {
      console.error('Simulate response error:', error);
      alert('Failed to simulate response');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Venue Search</h1>
          <p className="text-gray-600">Search and compare wedding venues based on your criteria</p>
        </div>

        {/* Search Criteria Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Search Criteria</h2>

          <div className="space-y-6">
            {/* Hard Criteria */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-pink-600">Hard Criteria (Must-Have)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={criteria.hardCriteria.location}
                    onChange={(e) => setCriteria({
                      ...criteria,
                      hardCriteria: { ...criteria.hardCriteria, location: e.target.value }
                    })}
                    placeholder="e.g., Brighton, London"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guest Count</label>
                  <input
                    type="number"
                    value={criteria.hardCriteria.guestCount}
                    onChange={(e) => setCriteria({
                      ...criteria,
                      hardCriteria: { ...criteria.hardCriteria, guestCount: e.target.value }
                    })}
                    placeholder="e.g., 100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget (£)</label>
                  <input
                    type="number"
                    value={criteria.hardCriteria.budget}
                    onChange={(e) => setCriteria({
                      ...criteria,
                      hardCriteria: { ...criteria.hardCriteria, budget: e.target.value }
                    })}
                    placeholder="e.g., 15000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catering Preference</label>
                  <input
                    type="text"
                    value={criteria.hardCriteria.cateringPreference}
                    onChange={(e) => setCriteria({
                      ...criteria,
                      hardCriteria: { ...criteria.hardCriteria, cateringPreference: e.target.value }
                    })}
                    placeholder="e.g., halal, kosher, vegan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="needsAccommodation"
                    checked={criteria.hardCriteria.needsAccommodation}
                    onChange={(e) => setCriteria({
                      ...criteria,
                      hardCriteria: { ...criteria.hardCriteria, needsAccommodation: e.target.checked }
                    })}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <label htmlFor="needsAccommodation" className="ml-2 block text-sm text-gray-700">
                    Needs Accommodation
                  </label>
                </div>
              </div>
            </div>

            {/* Soft Criteria */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-blue-600">Soft Criteria (Nice-to-Have)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aesthetic Preference</label>
                  <input
                    type="text"
                    value={criteria.softCriteria.aestheticPreference}
                    onChange={(e) => setCriteria({
                      ...criteria,
                      softCriteria: { ...criteria.softCriteria, aestheticPreference: e.target.value }
                    })}
                    placeholder="e.g., rustic, modern, barn"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="needsOutdoorSpace"
                    checked={criteria.softCriteria.needsOutdoorSpace}
                    onChange={(e) => setCriteria({
                      ...criteria,
                      softCriteria: { ...criteria.softCriteria, needsOutdoorSpace: e.target.checked }
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="needsOutdoorSpace" className="ml-2 block text-sm text-gray-700">
                    Prefers Outdoor Space
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Scraping web for venues...' : 'Search Venues'}
              </button>
              {matchedVenues.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                  >
                    Deselect All
                  </button>
                  <button
                    onClick={handleGenerateEmails}
                    disabled={selectedVenues.size === 0 || generatingEmails}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                  >
                    {generatingEmails ? 'Generating...' : `Generate Emails (${selectedVenues.size})`}
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {matchedVenues.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-semibold">
                Found {matchedVenues.length} Matching Venues
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedVenues.size} selected for email outreach
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pricing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Match Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hard Criteria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Highlights
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {matchedVenues.map((match) => (
                    <tr key={match.venue.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedVenues.has(match.venue.id)}
                          onChange={() => toggleVenueSelection(match.venue.id)}
                          className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{match.venue.name}</div>
                        <div className="text-sm text-gray-500">{match.venue.aesthetic.join(', ')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {match.venue.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {match.venue.capacity} guests
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {match.venue.pricing?.min && match.venue.pricing?.max
                            ? `£${match.venue.pricing.min.toLocaleString()} - £${match.venue.pricing.max.toLocaleString()}`
                            : typeof match.venue.pricing === 'string' ? match.venue.pricing : 'Contact for pricing'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className={`text-2xl font-bold ${
                              match.overallScore >= 80 ? 'text-green-600' :
                              match.overallScore >= 60 ? 'text-yellow-600' :
                              'text-gray-600'
                            }`}>
                              {match.overallScore}
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  match.overallScore >= 80 ? 'bg-green-600' :
                                  match.overallScore >= 60 ? 'bg-yellow-600' :
                                  'bg-gray-600'
                                }`}
                                style={{ width: `${match.overallScore}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {Object.entries(match.hardCriteriaDetails).map(([key, detail]) => (
                            <div key={key} className="flex items-center text-xs">
                              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                detail.pass ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              <span className="text-gray-600">{detail.reason}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {match.venue.hasAccommodation && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-1 mb-1">
                              {match.venue.accommodationRooms} rooms
                            </span>
                          )}
                          {match.venue.hasOutdoorSpace && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-1 mb-1">
                              Outdoor space
                            </span>
                          )}
                          {match.venue.cateringTypes.slice(0, 2).map(type => (
                            <span key={type} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mr-1 mb-1">
                              {type}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {match.venue.status === 'not_contacted' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Not Contacted
                          </span>
                        )}
                        {match.venue.status === 'contacted' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ⏳ Awaiting Response
                          </span>
                        )}
                        {match.venue.status === 'responded' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Responded
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {match.venue.status === 'contacted' && (
                          <button
                            onClick={() => handleSimulateResponse(match.venue.id)}
                            className="text-purple-600 hover:text-purple-900 font-medium"
                          >
                            Simulate Response
                          </button>
                        )}
                        {match.venue.status === 'responded' && (
                          <button
                            onClick={() => {
                              setSelectedVenueDetails(match.venue);
                              setShowDetailsModal(true);
                            }}
                            className="text-green-600 hover:text-green-900 font-medium"
                          >
                            View Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && hasSearched && matchedVenues.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-5xl mb-4">😔</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Venues Found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any venues matching your criteria. Try adjusting your requirements:
            </p>
            <ul className="text-left max-w-md mx-auto text-gray-600 space-y-2">
              <li>• Increase your budget</li>
              <li>• Reduce minimum guest count</li>
              <li>• Expand location search area</li>
              <li>• Remove specific catering requirements</li>
            </ul>
          </div>
        )}

        {!hasSearched && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">Enter your criteria above and click "Search Venues" to see matching venues</p>
          </div>
        )}

        {/* Email Review Modal */}
        {showEmailReview && generatedEmails.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Review Emails</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Review and edit emails before sending to {generatedEmails.filter(e => e.success).length} venues
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={demoMode}
                        onChange={(e) => setDemoMode(e.target.checked)}
                        className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-900">Demo Mode</span>
                    </label>
                    {demoMode && (
                      <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                        All emails → saurabhbains@berkeley.edu
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {generatedEmails.map((email, index) => (
                  <div key={email.venueId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{email.venueName}</h3>
                        {email.venueEmail && (
                          <p className="text-sm text-gray-600">To: {email.venueEmail}</p>
                        )}
                      </div>
                      {email.success ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          ✓ Generated
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                          ✗ Failed
                        </span>
                      )}
                    </div>

                    {email.success ? (
                      <textarea
                        value={email.emailBody}
                        onChange={(e) => {
                          const updated = [...generatedEmails];
                          updated[index].emailBody = e.target.value;
                          setGeneratedEmails(updated);
                        }}
                        className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 font-mono text-sm"
                      />
                    ) : (
                      <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        Error: {email.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
                <button
                  onClick={() => setShowEmailReview(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendBatchEmails}
                  disabled={sendingEmails}
                  className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {sendingEmails ? 'Sending...' : `Send All Emails (${generatedEmails.filter(e => e.success).length})`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Venue Response Details Modal */}
        {showDetailsModal && selectedVenueDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
                <h2 className="text-2xl font-bold text-gray-900">{selectedVenueDetails.name}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Response received {selectedVenueDetails.responseData?.responseDate ? new Date(selectedVenueDetails.responseData.responseDate).toLocaleDateString() : 'recently'}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                {selectedVenueDetails.responseData && (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">✓</span>
                        <h3 className="font-semibold text-green-900">Venue Responded!</h3>
                      </div>
                      <p className="text-green-800">{selectedVenueDetails.responseData.availability}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <p><span className="font-medium">Contact Person:</span> {selectedVenueDetails.responseData.contactPerson}</p>
                        <p><span className="font-medium">Email:</span> {selectedVenueDetails.responseData.contactEmail}</p>
                        <p><span className="font-medium">Phone:</span> {selectedVenueDetails.responseData.contactPhone}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Pricing & Details</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-gray-800">{selectedVenueDetails.responseData.pricing}</p>
                        <p className="text-gray-700 mt-2">{selectedVenueDetails.responseData.additionalInfo}</p>
                      </div>
                    </div>

                    {selectedVenueDetails.responseData.attachments && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Attachments</h3>
                        <div className="space-y-2">
                          {selectedVenueDetails.responseData.attachments.map((attachment: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center">
                                <span className="text-2xl mr-3">📄</span>
                                <div>
                                  <p className="font-medium text-gray-900">{attachment.name}</p>
                                  <p className="text-sm text-gray-500">{attachment.size}</p>
                                </div>
                              </div>
                              <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Venue Summary</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600">Capacity</p>
                          <p className="font-semibold text-gray-900">{selectedVenueDetails.capacity} guests</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600">Pricing Range</p>
                          <p className="font-semibold text-gray-900">
                            {selectedVenueDetails.pricing?.min && selectedVenueDetails.pricing?.max
                              ? `£${selectedVenueDetails.pricing.min.toLocaleString()} - £${selectedVenueDetails.pricing.max.toLocaleString()}`
                              : selectedVenueDetails.pricing || 'Contact for pricing'}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="font-semibold text-gray-900">{selectedVenueDetails.location}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600">Accommodation</p>
                          <p className="font-semibold text-gray-900">
                            {selectedVenueDetails.hasAccommodation ? `${selectedVenueDetails.accommodationRooms} rooms` : 'Not available'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                >
                  Mark as Shortlisted
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
