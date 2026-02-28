'use client';

import { useState, useEffect } from 'react';
import { MatchResult } from '@/lib/venue-matcher';

export default function VenuesPage() {
  const [matchedVenues, setMatchedVenues] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleSearch = async () => {
    setLoading(true);
    setError('');

    try {
      // Convert form values to proper types
      const searchCriteria = {
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

      const response = await fetch('/api/match-venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria: searchCriteria }),
      });

      const data = await response.json();

      if (data.success) {
        setMatchedVenues(data.results);
      } else {
        setError(data.error || 'Failed to match venues');
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
                {loading ? 'Searching...' : 'Search Venues'}
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
                    disabled={selectedVenues.size === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                  >
                    Send Emails ({selectedVenues.size})
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
                          £{match.venue.pricing.min.toLocaleString()} - £{match.venue.pricing.max.toLocaleString()}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {matchedVenues.length === 0 && !loading && !error && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">Enter your criteria above and click "Search Venues" to see matching venues</p>
          </div>
        )}
      </div>
    </div>
  );
}
