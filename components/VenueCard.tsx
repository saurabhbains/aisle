'use client';

interface VenueCardProps {
  venueInfo: any;
  onGenerateEmail: () => void;
}

export default function VenueCard({ venueInfo, onGenerateEmail }: VenueCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{venueInfo.venueName || 'Unknown Venue'}</h3>
          <p className="text-gray-600 mt-1">📍 {venueInfo.location || 'Location not specified'}</p>
        </div>
        <button
          onClick={onGenerateEmail}
          className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          ✉️ Generate Email
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">Capacity</p>
          <p className="text-lg font-semibold">{venueInfo.capacity ? `${venueInfo.capacity} guests` : 'Not specified'}</p>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">Pricing</p>
          <p className="text-lg font-semibold">{venueInfo.pricing || 'Contact for pricing'}</p>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">Accommodation</p>
          <p className="text-lg font-semibold">{venueInfo.hasAccommodation ? '✅ Yes' : '❌ No'}</p>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">Outdoor Space</p>
          <p className="text-lg font-semibold">{venueInfo.hasOutdoorSpace ? '✅ Yes' : '❌ No'}</p>
        </div>
      </div>

      {venueInfo.cateringOptions && (
        <div className="mt-4 bg-blue-50 p-3 rounded">
          <p className="text-sm text-gray-600">Catering</p>
          <p className="text-sm font-semibold text-blue-900">{venueInfo.cateringOptions}</p>
        </div>
      )}

      {venueInfo.amenities && venueInfo.amenities.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {venueInfo.amenities.map((amenity: string, index: number) => (
              <span
                key={index}
                className="bg-pink-100 text-pink-800 text-xs font-semibold px-3 py-1 rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {venueInfo.notes && (
        <div className="mt-4 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
          <p className="text-sm text-gray-700">{venueInfo.notes}</p>
        </div>
      )}
    </div>
  );
}
