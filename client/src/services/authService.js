import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getAvailableFlats: async () => {
    const response = await api.get('/auth/flats');
    return response.data;
  },

  getResidentDashboard: async () => {
    const response = await api.get('/dashboard/resident');
    return response.data;
  },

  getAdminDashboard: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  getSecurityDashboard: async () => {
    const response = await api.get('/dashboard/security');
    return response.data;
  },
};

export default authService;
