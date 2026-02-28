'use client';

import { useState } from 'react';

interface EmailPreviewProps {
  subject: string;
  emailBody: string;
  venueName: string;
  onSend: (to: string, subject: string, body: string) => Promise<void>;
  onEdit: (newBody: string) => void;
}

export default function EmailPreview({ subject, emailBody, venueName, onSend, onEdit }: EmailPreviewProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(emailBody);

  const handleSend = async () => {
    if (!recipientEmail) {
      alert('Please enter recipient email');
      return;
    }

    setIsSending(true);
    try {
      await onSend(recipientEmail, subject, isEditing ? editedBody : emailBody);
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      alert('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveEdit = () => {
    onEdit(editedBody);
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-bold text-gray-800">Generated Email</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-pink-600 hover:text-pink-700 font-semibold text-sm"
          >
            ✏️ Edit
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">To:</label>
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="venue@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Subject:</label>
          <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            {subject}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Message:</label>
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono text-sm"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveEdit}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditedBody(emailBody);
                    setIsEditing(false);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-wrap text-sm">
              {emailBody}
            </div>
          )}
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            onClick={handleSend}
            disabled={isSending || sent}
            className={`flex-1 font-bold py-3 px-6 rounded-lg transition-all ${
              sent
                ? 'bg-green-600 text-white'
                : isSending
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-pink-600 hover:bg-pink-700 text-white'
            }`}
          >
            {sent ? '✅ Email Sent!' : isSending ? 'Sending...' : '📧 Send Email'}
          </button>

          <button
            onClick={() => navigator.clipboard.writeText(emailBody)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all"
          >
            📋 Copy
          </button>
        </div>

        {sent && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold">
              ✅ Email successfully sent to {recipientEmail}!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
