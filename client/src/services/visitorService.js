import api from './api';

export const visitorService = {
  // Resident pre-approves a visitor
  createVisitor: async (visitorData) => {
    const response = await api.post('/visitors', visitorData);
    return response.data;
  },

  // Resident views their own visitor history
  getMyVisitors: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/visitors/my${query ? `?${query}` : ''}`);
    return response.data;
  },

  // Security / Admin views today's visitors
  getTodayVisitors: async () => {
    const response = await api.get('/visitors/today');
    return response.data;
  },

  // Security / Admin views all society visitors
  getAllVisitors: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/visitors${query ? `?${query}` : ''}`);
    return response.data;
  },

  // Get visitor details by ID
  getVisitorById: async (id) => {
    const response = await api.get(`/visitors/${id}`);
    return response.data;
  },

  // Security / Admin checks in visitor
  checkInVisitor: async (id) => {
    const response = await api.patch(`/visitors/${id}/checkin`);
    return response.data;
  },

  // Security / Admin checks out visitor
  checkOutVisitor: async (id) => {
    const response = await api.patch(`/visitors/${id}/checkout`);
    return response.data;
  },

  // Resident / Admin cancels visitor pass
  cancelVisitor: async (id) => {
    const response = await api.patch(`/visitors/${id}/cancel`);
    return response.data;
  },

  // Security gate lookup by pass code
  verifyPassCode: async (passCode) => {
    const response = await api.get(`/visitors/verify/${passCode}`);
    return response.data;
  },
};

export default visitorService;
