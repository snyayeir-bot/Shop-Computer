import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthenticated or token expired, clear local storage
      // Only redirect if not on public routes
      const publicPaths = ['/', '/products', '/login', '/register'];
      if (!publicPaths.includes(window.location.pathname)) {
        // localStorage.removeItem('token');
        // localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
