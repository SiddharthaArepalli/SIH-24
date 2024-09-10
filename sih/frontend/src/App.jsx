import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [file, setFile] = useState(null);
  const [originalText, setOriginalText] = useState('');
  const [redactedText, setRedactedText] = useState('');
  const [downloadLink, setDownloadLink] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/detect-pii', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response from backend:', response.data);

      const { originalText, redactedText, pdf } = response.data;

      setOriginalText(originalText || 'No original text found.');
      setRedactedText(redactedText || 'No redacted text found.');

      if (pdf) {
        // Generate a URL for the redacted PDF
        const fileUrl = `data:application/pdf;base64,${pdf}`;
        setDownloadLink(fileUrl);
      } else {
        setDownloadLink(null);
      }
      setError(null);
    } catch (err) {
      console.error('Error uploading the file:', err);
      setError('An error occurred while processing the file. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">PII Detection Tool</h1>

      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        />
      </div>

      <button
        onClick={handleUpload}
        className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
      >
        Upload
      </button>

      {error && (
        <div className="mt-6 p-4 bg-red-200 text-red-800 rounded-md">
          <p>{error}</p>
        </div>
      )}

      {originalText && (
        <div className="mt-6 w-full max-w-4xl p-4 bg-gray-200 rounded-md shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Original Text:</h2>
          <pre className="whitespace-pre-wrap">{originalText}</pre>
        </div>
      )}

      {redactedText && (
        <div className="mt-6 w-full max-w-4xl p-4 bg-gray-200 rounded-md shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Redacted Text:</h2>
          <pre className="whitespace-pre-wrap">{redactedText}</pre>
        </div>
      )}

      {downloadLink && (
        <div className="mt-4">
          <a href={downloadLink} download="redacted.pdf" className="px-6 py-2 bg-blue-500 text-white rounded-md">
            Download Redacted PDF
          </a>
        </div>
      )}
    </div>
  );
};

export default App;
