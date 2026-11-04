import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL.replace(/\/api$/, '');
export const authHeaders = () => { const token = localStorage.getItem('wrenchly_token'); return token ? { Authorization: `Bearer ${token}` } : {}; };
export const apiRequest = async (path, options = {}) => {
  const response = await axios({ baseURL: API_URL, url: path, method: options.method || 'GET', data: options.body, params: options.params, headers: { ...authHeaders(), ...(options.headers || {}) } });
  return response.data;
};
