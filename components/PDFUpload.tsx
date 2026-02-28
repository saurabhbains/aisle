'use client';

import { useState } from 'react';

interface PDFUploadProps {
  onVenueExtracted: (venueInfo: any) => void;
}

export default function PDFUpload({ onVenueExtracted }: PDFUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed');
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, file.type, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    // Check file size (40MB limit)
    const maxSize = 40 * 1024 * 1024; // 40MB in bytes
    if (file.size > maxSize) {
      alert(`PDF file is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Please use a file smaller than 40MB.`);
      return;
    }

    setFileName(file.name);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 413) {
          alert('PDF file is too large. Please use a smaller file (under 40MB).');
        } else {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          alert('Failed to upload PDF. Error: ' + response.status);
        }
        return;
      }

      const data = await response.json();

      if (data.success) {
        onVenueExtracted(data.venueInfo);
      } else {
        alert('Failed to parse PDF: ' + data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload PDF');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!pastedText.trim()) {
      alert('Please paste some text from the venue brochure');
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch('/api/extract-from-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pastedText }),
      });

      const data = await response.json();

      if (data.success) {
        onVenueExtracted(data.venueInfo);
        setPastedText('');
        setShowTextInput(false);
      } else {
        alert('Failed to extract venue info: ' + data.error);
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      alert('Failed to process text');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload Venue Brochure</h2>
      <p className="text-gray-600 mb-4">
        Upload a venue's PDF brochure and our AI will extract all the important details for you.
      </p>

      {!showTextInput ? (
        <>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 transition-colors">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          id="pdf-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="pdf-upload"
          className="cursor-pointer flex flex-col items-center space-y-3"
          onClick={() => console.log('Label clicked')}
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
              <p className="text-gray-600 font-semibold">Analyzing PDF...</p>
              <p className="text-sm text-gray-500">{fileName}</p>
            </>
          ) : (
            <>
              <div className="text-6xl">📄</div>
              <div>
                <p className="text-lg font-semibold text-gray-700">Click to upload PDF</p>
                <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                <p className="text-xs text-gray-400 mt-2">Maximum file size: 40MB</p>
              </div>
              {fileName && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {fileName}
                </p>
              )}
            </>
          )}
        </label>
      </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> We'll extract pricing, capacity, amenities, and more automatically!
            </p>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => setShowTextInput(true)}
              className="text-pink-600 hover:text-pink-700 text-sm font-medium underline"
            >
              PDF too large? Paste text instead →
            </button>
          </div>
        </>
      ) : (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste venue brochure text (for large PDFs)
            </label>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste the text from the venue brochure here...&#10;&#10;Include details like:&#10;- Venue name and location&#10;- Capacity&#10;- Pricing&#10;- Amenities&#10;- Catering options"
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
              disabled={isUploading}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleTextSubmit}
              disabled={isUploading || !pastedText.trim()}
              className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Processing...' : 'Extract Venue Info'}
            </button>
            <button
              onClick={() => setShowTextInput(false)}
              disabled={isUploading}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
