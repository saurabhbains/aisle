'use client';

import { useState } from 'react';

interface PDFUploadProps {
  onVenueExtracted: (venueInfo: any) => void;
}

export default function PDFUpload({ onVenueExtracted }: PDFUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');

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

    // Check file size (4.5MB limit for Vercel serverless functions)
    const maxSize = 4.5 * 1024 * 1024; // 4.5MB in bytes
    if (file.size > maxSize) {
      alert(`PDF file is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Please use a file smaller than 4.5MB.`);
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
          alert('PDF file is too large. Please use a smaller file (under 4.5MB).');
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload Venue Brochure</h2>
      <p className="text-gray-600 mb-6">
        Upload a venue's PDF brochure and our AI will extract all the important details for you.
      </p>

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
                <p className="text-xs text-gray-400 mt-2">Maximum file size: 4.5MB</p>
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
    </div>
  );
}
