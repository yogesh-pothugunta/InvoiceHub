import axios from 'axios';

const API = axios.create({
  baseURL: 'https://invoicehub-backend-7smj.onrender.com/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ih_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default API;