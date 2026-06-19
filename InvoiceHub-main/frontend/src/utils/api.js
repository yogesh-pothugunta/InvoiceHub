import axios from 'axios';

const API = axios.create({
  baseURL: 'https://invoicehub-6hhp.onrender.com/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ih_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ih_token');
      localStorage.removeItem('ih_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;