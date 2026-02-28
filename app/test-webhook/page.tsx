'use client';

import { useState } from 'react';

export default function TestWebhookPage() {
  const [venueEmail, setVenueEmail] = useState('weddings@clivedenhouse.co.uk');
  const [emailBody, setEmailBody] = useState(`Dear Couple,

Thank you for your wedding venue inquiry at Cliveden House.

We are delighted to confirm that we have availability for your date in July 2026.

Our wedding packages start at £12,000 for 100 guests, which includes:
- Exclusive use of our Georgian mansion
- Champagne reception
- Three-course wedding breakfast
- Evening entertainment

We have 48 luxury bedrooms available for your guests at a discounted rate of £250 per night.

I've attached our full wedding brochure with more details.

Please let me know if you'd like to schedule a viewing.

Best regards,
Sarah Johnson
Events Manager
Cliveden House
Phone: +44 1628 668561`);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleTest = async () => {
    setLoading(true);
    setResult(null);

    try {
      // If PDF is attached, convert to base64 first
      let pdfBase64 = null;
      if (pdfFile) {
        const reader = new FileReader();
        pdfBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(pdfFile);
        });
      }

      // Create a mock Resend webhook payload
      const mockPayload = {
        type: 'email.received',
        created_at: new Date().toISOString(),
        data: {
          email_id: 'test-' + Date.now(),
          from: venueEmail,
          to: ['test@aisle-wedding.resend.dev'],
          subject: 'Re: Wedding Venue Inquiry',
          text: emailBody,
          html: `<p>${emailBody.replace(/\n/g, '<br>')}</p>`,
          attachments: pdfFile ? [
            {
              filename: pdfFile.name,
              content_type: 'application/pdf',
              size: pdfFile.size,
              content: pdfBase64,
            }
          ] : []
        }
      };

      const response = await fetch('/api/webhooks/resend-inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockPayload),
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Test Inbound Email Webhook</h1>
        <p className="text-gray-600 mb-8">
          Simulate receiving an email reply from a venue to test the webhook processing
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue Email (From)
            </label>
            <input
              type="email"
              value={venueEmail}
              onChange={(e) => setVenueEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="venue@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must match an email in your venue database
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Body
            </label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              rows={15}
              placeholder="Email body text..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Include pricing, availability, contact info, etc.
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF Attachment (Optional)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {pdfFile && (
              <p className="text-sm text-green-600 mt-2">
                ✓ {pdfFile.name} ({Math.round(pdfFile.size / 1024)} KB)
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Upload a PDF brochure to test attachment parsing
            </p>
          </div>

          <button
            onClick={handleTest}
            disabled={loading}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Processing...' : 'Simulate Venue Response'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              {result.success ? '✅ Success' : '❌ Error'}
            </h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>

            {result.success && result.venueId && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 font-medium">
                  ✓ Venue {result.venueId} has been updated to 'responded' status
                </p>
                <p className="text-green-700 text-sm mt-1">
                  Check the <a href="/venues" className="underline">venues page</a> to see the updated venue
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
