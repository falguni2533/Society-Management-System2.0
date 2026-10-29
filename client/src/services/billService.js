import api from './api';

export const billService = {
  // Resident gets their own bills
  getMyBills: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/bills/my${query ? `?${query}` : ''}`);
    return response.data;
  },

  // Admin gets all society bills
  getAllBills: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/bills${query ? `?${query}` : ''}`);
    return response.data;
  },

  // Get bill details by ID
  getBillById: async (id) => {
    const response = await api.get(`/bills/${id}`);
    return response.data;
  },

  // Admin creates a new bill
  createBill: async (billData) => {
    const response = await api.post('/bills', billData);
    return response.data;
  },

  // Admin updates bill status / marks as Paid
  updateBillStatus: async (id, statusData) => {
    const response = await api.patch(`/bills/${id}/status`, statusData);
    return response.data;
  },

  // Admin deletes a bill
  deleteBill: async (id) => {
    const response = await api.delete(`/bills/${id}`);
    return response.data;
  },
};

export default billService;
