import axios from 'axios';

// Try to get API URL from multiple sources
const getApiUrl = () => {
  // 1. Try environment variable (build time)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. Try runtime config (from config.js)
  if (window.APP_CONFIG && window.APP_CONFIG.API_URL) {
    return window.APP_CONFIG.API_URL;
  }
  
  // 3. Default fallback
  return 'https://refundassistant.onrender.com';
};

const API_BASE_URL = getApiUrl();

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const healthCheck = () => api.get('/health');

export const getCases = (demoOnly = false) => api.get('/cases', { params: { demo_only: demoOnly } });

export const getCaseById = (caseId) => api.get(`/cases/${caseId}`);

export const extractTextFeatures = (text) => api.post('/nlp/extract', { text });

export const getImpact = (params) => api.get('/impact', { params });

export const getPolicy = () => api.get('/policy');

export const togglePolicyRule = (ruleCode) => api.post('/policy/toggle', { rule_code: ruleCode });

export const updatePolicyWeight = (ruleCode, weight) => api.post('/policy/weight', { rule_code: ruleCode, weight });

export const applyPolicyPreset = (preset) => api.post('/policy/preset', { preset });

export default api;

