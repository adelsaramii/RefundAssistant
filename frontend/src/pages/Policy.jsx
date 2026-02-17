import { useState, useEffect } from 'react';
import { getPolicy, togglePolicyRule, updatePolicyWeight, applyPolicyPreset } from '../api';

export default function Policy() {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    try {
      setLoading(true);
      const response = await getPolicy();
      setPolicy(response.data);
    } catch (err) {
      console.error('Failed to load policy:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (ruleCode) => {
    try {
      setUpdating(true);
      await togglePolicyRule(ruleCode);
      await loadPolicy();
      showMessage(`Rule ${ruleCode} toggled successfully`, 'success');
    } catch (err) {
      showMessage('Failed to toggle rule', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleWeightChange = async (ruleCode, weight) => {
    try {
      setUpdating(true);
      await updatePolicyWeight(ruleCode, weight);
      await loadPolicy();
      showMessage(`Rule ${ruleCode} weight updated to ${weight}`, 'success');
    } catch (err) {
      showMessage('Failed to update weight', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handlePreset = async (preset) => {
    try {
      setUpdating(true);
      const response = await applyPolicyPreset(preset);
      await loadPolicy();
      showMessage(response.data.message, 'success');
    } catch (err) {
      showMessage('Failed to apply preset', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Policy Management</h2>
        <p className="mt-2 text-sm text-gray-600">
          Configure refund decision rules and weights
        </p>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Presets */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Presets</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handlePreset('strict')}
            disabled={updating}
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors disabled:opacity-50"
          >
            <span className="text-3xl mb-2">🔒</span>
            <span className="font-medium text-gray-900">Strict Mode</span>
            <span className="text-xs text-gray-500 text-center mt-1">
              Higher fraud detection, require more evidence
            </span>
          </button>

          <button
            onClick={() => handlePreset('friendly')}
            disabled={updating}
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            <span className="text-3xl mb-2">😊</span>
            <span className="font-medium text-gray-900">Customer Friendly</span>
            <span className="text-xs text-gray-500 text-center mt-1">
              More lenient, prioritize customer satisfaction
            </span>
          </button>

          <button
            onClick={() => handlePreset('delay-tolerant')}
            disabled={updating}
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors disabled:opacity-50"
          >
            <span className="text-3xl mb-2">⏰</span>
            <span className="font-medium text-gray-900">Delay Tolerant</span>
            <span className="text-xs text-gray-500 text-center mt-1">
              Less penalty for delivery delays
            </span>
          </button>
        </div>
      </div>

      {/* Policy Rules */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Policy Rules</h3>
        <div className="space-y-6">
          {policy && policy.rules.map((rule) => (
            <div key={rule.rule_code} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-base font-medium text-gray-900">
                      {rule.rule_code.replace(/_/g, ' ')}
                    </h4>
                    <button
                      onClick={() => handleToggle(rule.rule_code)}
                      disabled={updating}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 ${
                        rule.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          rule.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className={`text-sm ${rule.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Weight: {rule.weight.toFixed(1)}
                  </label>
                  <span className="text-xs text-gray-500">
                    Range: 0.0 (minimal) - 2.0 (maximum)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={rule.weight}
                  onChange={(e) => handleWeightChange(rule.rule_code, parseFloat(e.target.value))}
                  disabled={updating || !rule.enabled}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0.0</span>
                  <span>1.0</span>
                  <span>2.0</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">About Policy Rules</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Policy rules determine how refund decisions are made. Each rule can be enabled/disabled 
                and weighted. Higher weights mean the rule has more impact on the final decision. 
                Changes take effect immediately for new evaluations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

