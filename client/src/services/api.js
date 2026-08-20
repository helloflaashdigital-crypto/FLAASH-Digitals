import axios from 'axios';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1', withCredentials: true });
export const adminTokenKey = 'flaash_admin_token';
export const getAdminToken = () => typeof window === 'undefined' ? '' : sessionStorage.getItem(adminTokenKey) || '';
export const setAdminToken = token => { if (typeof window !== 'undefined' && token) sessionStorage.setItem(adminTokenKey, token); };
export const clearAdminToken = () => { if (typeof window !== 'undefined') sessionStorage.removeItem(adminTokenKey); };
api.interceptors.request.use(config => {
  const needsAdminAuth = config.url === '/auth/me' || config.url === '/auth/logout' || config.url?.startsWith('/admin/');
  const token = needsAdminAuth && getAdminToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export const getCollection = async (name, params = {}) => (await api.get(`/${name}`, { params })).data.data;
