import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCases } from '../api';

export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const response = await getCases(false);
      setCases(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load cases. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'approve') return item.suggestion.decision === 'APPROVE';
    if (filter === 'reject') return item.suggestion.decision === 'REJECT';
    if (filter === 'partial') return item.suggestion.decision === 'PARTIAL_REFUND';
    return true;
  });

  const getDecisionBadge = (decision) => {
    const styles = {
      APPROVE: 'bg-green-100 text-green-800',
      REJECT: 'bg-red-100 text-red-800',
      PARTIAL_REFUND: 'bg-yellow-100 text-yellow-800',
      REVIEW: 'bg-blue-100 text-blue-800',
    };
    return styles[decision] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    total: cases.length,
    approved: cases.filter(c => c.suggestion.decision === 'APPROVE').length,
    rejected: cases.filter(c => c.suggestion.decision === 'REJECT').length,
    partial: cases.filter(c => c.suggestion.decision === 'PARTIAL_REFUND').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Refund Cases Dashboard</h2>
        <p className="mt-2 text-sm text-gray-600">
          Review and manage food delivery refund requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Cases</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">{stats.approved}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
            <dd className="mt-1 text-3xl font-semibold text-red-600">{stats.rejected}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Partial</dt>
            <dd className="mt-1 text-3xl font-semibold text-yellow-600">{stats.partial}</dd>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {['all', 'approve', 'reject', 'partial'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredCases.map((item) => (
            <li key={item.case.case_id}>
              <Link to={`/case/${item.case.case_id}`} className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          Case #{item.case.case_id}
                        </p>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDecisionBadge(item.suggestion.decision)}`}>
                          {item.suggestion.decision.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          Score: {item.suggestion.confidence_score.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span className="truncate">
                          {item.case.complaint_type} • ${item.case.order_value}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {item.suggestion.refund_amount > 0 && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${item.suggestion.refund_amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">Refund</p>
                        </div>
                      )}
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

