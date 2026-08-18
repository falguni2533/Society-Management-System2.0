import api from './api';

export const complaintService = {
  // Resident creates complaint
  createComplaint: async (complaintData) => {
    const response = await api.post('/complaints', complaintData);
    return response.data;
  },

  // Resident views their own complaints
  getMyComplaints: async () => {
    const response = await api.get('/complaints/my');
    return response.data;
  },

  // Admin views all complaints with optional filters
  getAllComplaints: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.priority) params.append('priority', filters.priority);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/complaints${queryString}`);
    return response.data;
  },

  // Get complaint by ID
  getComplaintById: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  // Admin updates status & resolution note
  updateComplaintStatus: async (id, updateData) => {
    const response = await api.patch(`/complaints/${id}/status`, updateData);
    return response.data;
  },
};

export default complaintService;
