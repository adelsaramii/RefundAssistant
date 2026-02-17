import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://refundassistant.onrender.com';

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

