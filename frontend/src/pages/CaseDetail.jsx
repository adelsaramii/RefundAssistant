import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCaseById } from '../api';

export default function CaseDetail() {
  const { caseId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCase();
  }, [caseId]);

  const loadCase = async () => {
    try {
      setLoading(true);
      const response = await getCaseById(caseId);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load case details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
        {error || 'Case not found'}
      </div>
    );
  }

  const { case: caseData, suggestion } = data;

  const getDecisionColor = (decision) => {
    const colors = {
      APPROVE: 'bg-green-100 text-green-800 border-green-200',
      REJECT: 'bg-red-100 text-red-800 border-red-200',
      PARTIAL_REFUND: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      REVIEW: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[decision] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div>
      <div className="mb-6">
        <Link to="/" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl leading-6 font-bold text-gray-900">
                Case #{caseData.case_id}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Refund request details and recommendation
              </p>
            </div>
            <span className={`px-4 py-2 text-lg font-semibold rounded-lg border-2 ${getDecisionColor(suggestion.decision)}`}>
              {suggestion.decision.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-200">
          {/* Suggestion Summary */}
          <div className="bg-indigo-50 px-4 py-5 sm:px-6">
            <h4 className="text-lg font-medium text-indigo-900 mb-3">Recommendation</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-indigo-700">Confidence Score</p>
                <p className="text-2xl font-bold text-indigo-900">{suggestion.confidence_score.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-indigo-700">Refund Amount</p>
                <p className="text-2xl font-bold text-indigo-900">${suggestion.refund_amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-indigo-700">Refund Percentage</p>
                <p className="text-2xl font-bold text-indigo-900">{suggestion.refund_percentage.toFixed(0)}%</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-indigo-700 font-medium">Reasoning:</p>
              <p className="mt-1 text-sm text-indigo-900">{suggestion.reasoning}</p>
            </div>
          </div>

          {/* Case Details */}
          <div className="px-4 py-5 sm:p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Case Information</h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Complaint Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseData.complaint_type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Order Value</dt>
                <dd className="mt-1 text-sm text-gray-900">${caseData.order_value}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Customer ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseData.customer_id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Restaurant ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseData.restaurant_id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Delivery Delay</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseData.delivery_delay_minutes} minutes</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Photo Evidence</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseData.photo_provided ? '✅ Yes' : '❌ No'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Customer Refund Count</dt>
                <dd className="mt-1 text-sm text-gray-900">{caseData.customer_refund_count}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Restaurant Error Rate</dt>
                <dd className="mt-1 text-sm text-gray-900">{(caseData.restaurant_error_rate * 100).toFixed(1)}%</dd>
              </div>
            </dl>
          </div>

          {/* Complaint Text */}
          {caseData.complaint_text && (
            <div className="px-4 py-5 sm:p-6 bg-gray-50 border-t border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Customer Complaint</h4>
              <p className="text-sm text-gray-700 italic bg-white p-4 rounded border border-gray-200">
                "{caseData.complaint_text}"
              </p>
            </div>
          )}

          {/* Score Breakdown */}
          <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Score Breakdown</h4>
            <div className="space-y-3">
              {suggestion.score_breakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.factor}</span>
                      <span className="text-sm text-gray-600">{item.value > 0 ? '+' : ''}{item.value.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.value > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(Math.abs(item.value) * 10, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

