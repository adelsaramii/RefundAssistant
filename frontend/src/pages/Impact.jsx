import { useState, useEffect } from 'react';
import { getImpact } from '../api';

export default function Impact() {
  const [params, setParams] = useState({
    orders_per_day: 1000,
    complaint_rate: 0.05,
    avg_order_value: 30,
    current_refund_rate: 0.6,
  });
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateImpact();
  }, []);

  const calculateImpact = async () => {
    try {
      setLoading(true);
      const response = await getImpact(params);
      setImpact(response.data);
    } catch (err) {
      console.error('Failed to calculate impact:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: parseFloat(value) }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Business Impact Calculator</h2>
        <p className="mt-2 text-sm text-gray-600">
          Calculate potential savings from refund optimization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Input Parameters</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orders per Day
              </label>
              <input
                type="number"
                value={params.orders_per_day}
                onChange={(e) => handleParamChange('orders_per_day', e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complaint Rate ({(params.complaint_rate * 100).toFixed(1)}%)
              </label>
              <input
                type="range"
                min="0"
                max="0.2"
                step="0.01"
                value={params.complaint_rate}
                onChange={(e) => handleParamChange('complaint_rate', e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Order Value ($)
              </label>
              <input
                type="number"
                value={params.avg_order_value}
                onChange={(e) => handleParamChange('avg_order_value', e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Refund Rate ({(params.current_refund_rate * 100).toFixed(0)}%)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={params.current_refund_rate}
                onChange={(e) => handleParamChange('current_refund_rate', e.target.value)}
                className="w-full"
              />
            </div>

            <button
              onClick={calculateImpact}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              {loading ? 'Calculating...' : 'Calculate Impact'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {impact && (
            <div className="space-y-6">
              {/* Current Metrics */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Situation</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-700">Annual Cost</p>
                    <p className="text-2xl font-bold text-red-900">{formatCurrency(impact.current_annual_cost)}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700">Cases per Year</p>
                    <p className="text-2xl font-bold text-blue-900">{impact.current_cases_per_year.toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-700">Hours per Year</p>
                    <p className="text-2xl font-bold text-purple-900">{impact.current_hours_per_year.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Improvement Scenarios */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Improvement Scenarios</h3>
                <div className="space-y-4">
                  {impact.scenarios.map((scenario, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {(scenario.improvement_pct * 100).toFixed(0)}% Improvement
                        </h4>
                        <span className="text-2xl font-bold text-green-600">
                          {formatCurrency(scenario.annual_savings)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Annual Savings</p>
                          <p className="font-medium text-gray-900">{formatCurrency(scenario.annual_savings)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Cases Prevented</p>
                          <p className="font-medium text-gray-900">{scenario.cases_prevented.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Time Saved</p>
                          <p className="font-medium text-gray-900">{scenario.time_saved_hours.toLocaleString()} hrs</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ROI Summary */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-green-900 mb-2">💰 ROI Summary</h3>
                <p className="text-sm text-green-800">
                  By implementing intelligent refund decision automation, you could save between{' '}
                  <span className="font-bold">{formatCurrency(impact.scenarios[0].annual_savings)}</span> and{' '}
                  <span className="font-bold">{formatCurrency(impact.scenarios[impact.scenarios.length - 1].annual_savings)}</span>
                  {' '}annually while improving customer satisfaction and operational efficiency.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

