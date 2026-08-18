import api from './api';

export const noticeService = {
  // Get all notices
  getNotices: async () => {
    const response = await api.get('/notices');
    return response.data;
  },

  // Get notice by ID
  getNoticeById: async (id) => {
    const response = await api.get(`/notices/${id}`);
    return response.data;
  },

  // Admin creates notice
  createNotice: async (noticeData) => {
    const response = await api.post('/notices', noticeData);
    return response.data;
  },

  // Admin deletes notice
  deleteNotice: async (id) => {
    const response = await api.delete(`/notices/${id}`);
    return response.data;
  },
};

export default noticeService;
