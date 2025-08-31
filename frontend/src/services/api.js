import axios from 'axios';

// Prefer env var, fallback to common local dev port 5000
const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:5000/api`
    : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optionally auto-logout on 401/403 to keep client state consistent
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      // Clear invalid tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const getFurniture = async () => (await api.get('/furniture')).data;

export const getFurnitureById = async (id) => (await api.get(`/furniture/${id}`)).data;

export const createOrder = async (orderData) => (await api.post('/orders', orderData)).data;

export const login = async (credentials) => {
  const response = await api.post('/users/login', credentials);
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  return response.data;
};

export const getProfile = async () => (await api.get('/users/profile')).data;

export const register = async (payload) => (await api.post('/users/register', payload)).data;

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getAllOrders = async () => (await api.get('/orders')).data;

export const getOrderById = async (id) => (await api.get(`/orders/${id}`)).data;

export const updateOrderStatus = async (id, status) => (await api.patch(`/orders/${id}/status`, { status })).data;

export const cancelOrder = async (id, email) => (await api.post(`/orders/${id}/cancel`, { email })).data;

export const seedFurniture = async () => (await api.post('/furniture/seed')).data;

export const seedAdmin = async () => (await api.post('/users/seed-admin')).data;
