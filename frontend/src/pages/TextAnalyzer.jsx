import { useState } from 'react';
import { extractTextFeatures } from '../api';

export default function TextAnalyzer() {
  const [text, setText] = useState('');
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await extractTextFeatures(text);
      setFeatures(response.data);
    } catch (err) {
      setError('Failed to analyze text. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exampleTexts = [
    "The food was cold when it arrived and the burger was missing the bacon I ordered. Really disappointed!",
    "Driver spilled my drink all over the bag, everything is soggy and ruined.",
    "This is the third time you've messed up my order. I want a full refund NOW!",
    "Pizza arrived 45 minutes late and was stone cold. Not acceptable.",
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Text Analysis Tool</h2>
        <p className="mt-2 text-sm text-gray-600">
          Extract structured features from complaint text using AI
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <label htmlFor="complaint-text" className="block text-sm font-medium text-gray-700 mb-2">
          Complaint Text
        </label>
        <textarea
          id="complaint-text"
          rows={6}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          placeholder="Enter customer complaint text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {exampleTexts.map((example, index) => (
              <button
                key={index}
                onClick={() => setText(example)}
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
              >
                Example {index + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {loading ? 'Analyzing...' : 'Analyze Text'}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>

      {features && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Extracted Features</h3>
          
          <div className="space-y-4">
            {/* Issue Types */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Issue Types Detected</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'food_quality_issue', label: 'Food Quality Issue' },
                  { key: 'missing_item', label: 'Missing Item' },
                  { key: 'wrong_item', label: 'Wrong Item' },
                  { key: 'temperature_problem', label: 'Temperature Problem' },
                  { key: 'packaging_problem', label: 'Packaging Problem' },
                  { key: 'delivery_spill', label: 'Delivery Spill' },
                ].map(({ key, label }) => (
                  <div
                    key={key}
                    className={`px-3 py-2 rounded-md text-sm ${
                      features[key]
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {features[key] ? '✅' : '❌'} {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Complaint Quality */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Complaint Quality</h4>
              <div className={`px-3 py-2 rounded-md text-sm ${
                features.vague_complaint
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  : 'bg-green-100 text-green-800 border border-green-200'
              }`}>
                {features.vague_complaint ? '⚠️ Vague Complaint' : '✅ Specific Complaint'}
              </div>
            </div>

            {/* Metrics */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Analysis Metrics</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Customer Aggression</span>
                    <span className="text-sm font-medium text-gray-900">{(features.customer_aggression * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${features.customer_aggression * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Evidence Strength</span>
                    <span className="text-sm font-medium text-gray-900">{(features.evidence_strength * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${features.evidence_strength * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Confidence</span>
                    <span className="text-sm font-medium text-gray-900">{(features.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{ width: `${features.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

