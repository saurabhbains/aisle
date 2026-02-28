import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
            💍 Aisle
          </h1>
          <p className="text-3xl md:text-4xl font-semibold text-gray-800 mb-6">
            Stop Drowning in Wedding Emails
          </p>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI that reads venue brochures, writes personalized emails, and sends them for you.
            Find your perfect venue in <span className="font-bold text-pink-600">hours, not months</span>.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold text-xl py-4 px-12 rounded-full transition-all transform hover:scale-105 shadow-lg"
            >
              Get Started 🚀
            </Link>
          </div>
        </div>

        {/* Problem Section */}
        <div className="mt-24 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            The Problem We're Solving
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">😫</div>
              <h3 className="text-xl font-bold mb-3">100+ Emails to Venues</h3>
              <p className="text-gray-600">
                Most couples send 100+ emails just to get basic pricing information. Each response is buried in a 20-page PDF.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-bold mb-3">20+ Hours Wasted</h3>
              <p className="text-gray-600">
                Reading brochures, tracking conversations across platforms, asking the same questions over and over.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-3">Chaotic & Fragmented</h3>
              <p className="text-gray-600">
                Conversations scattered across Hitched, email, phone calls. No single source of truth for your venue search.
              </p>
            </div>
          </div>
        </div>

        {/* Solution Section */}
        <div className="mt-24 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How Aisle Works
          </h2>

          <div className="space-y-8">
            <div className="flex items-start space-x-6 bg-white p-6 rounded-lg shadow-md">
              <div className="bg-pink-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">🎤 Speak Your Criteria</h3>
                <p className="text-gray-600">
                  Just talk naturally: "We want July 2025 in Brighton, 100 guests, £15k budget, need outdoor space."
                  Our AI extracts everything.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6 bg-white p-6 rounded-lg shadow-md">
              <div className="bg-pink-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">📄 Upload Venue PDFs</h3>
                <p className="text-gray-600">
                  Drop in those massive brochures. AI reads them in seconds and extracts: pricing, capacity, amenities,
                  catering options, everything you care about.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6 bg-white p-6 rounded-lg shadow-md">
              <div className="bg-pink-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">✨ AI Writes Perfect Emails</h3>
                <p className="text-gray-600">
                  Get personalized, warm, professional emails that reference specific venue details and your requirements.
                  Edit if you want, or send as-is.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6 bg-white p-6 rounded-lg shadow-md">
              <div className="bg-pink-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">📧 Actually Send Them</h3>
                <p className="text-gray-600">
                  Click send. Real emails go to real venues. Track everything in one dashboard.
                  No more chaos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center max-w-3xl mx-auto bg-gradient-to-r from-pink-600 to-purple-600 p-12 rounded-2xl shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Find Your Dream Venue?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Join couples who are saving 20+ hours on venue research
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-white text-pink-600 hover:bg-gray-100 font-bold text-xl py-4 px-12 rounded-full transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started Free →
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-24 text-center pb-12">
          <p className="text-gray-600 mb-4">
            Built for the 24-hour hackathon
          </p>
          <p className="text-gray-500 text-sm">
            💡 <strong>Vision:</strong> Automate the entire wedding planning process.
            Venue search is just the beginning.
          </p>
        </div>
      </div>
    </div>
  );
}
