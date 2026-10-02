const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
async function request(path) { const response = await fetch(`${API_URL}${path}`); if (!response.ok) throw new Error((await response.json()).error || 'Request failed'); return response.json(); }
export function getInventory(params) { return request(`/inventory?${new URLSearchParams(params)}`); }
export function getAnalytics(params) { return request(`/analytics?${new URLSearchParams(params)}`); }
