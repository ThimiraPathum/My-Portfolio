import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:8000/api/' 
    : 'https://my-portfolio-api-20fo.onrender.com/api/');

// Ensure the URL always ends with /api/
export const API_URL = rawApiUrl.replace(/\/$/, '') + (rawApiUrl.includes('/api') ? '/' : '/api/');
console.log('[API Config] Normalized API_URL:', API_URL);

// Derive BASE_URL carefully - it should be the root origin without /api
export const BASE_URL = API_URL.split('/api')[0];
console.log('[API Config] Derived BASE_URL for assets:', BASE_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: handle 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const errorData = error.response?.data;
    const originalRequest = error.config;
    const url = originalRequest?.url || '';

    // Log the error
    console.error(`[API Error] ${url}:`, errorData || error.message);
    if (error.response?.status === 422) {
      console.warn('[API Validation Error Details]:', JSON.stringify(errorData, null, 2));
    }

    // 1. Explicitly check if the failing request is the refresh call itself
    // If it is, DO NOT RETRY. Immediately log out to break any loop.
    if (url.includes('auth/refresh') && error.response?.status === 401) {
      console.error('[API Auth] Refresh call failed. Logging out to prevent loop.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
      return Promise.reject(error);
    }

    // 2. Handle 401 for other requests
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request if a refresh is already in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('[API Auth] Attempting token refresh...');
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No existing token to refresh');

        // Note: Use the raw axios or a separate instance if possible to avoid interceptors,
        // but here we rely on the url check above.
        const { data } = await api.post('auth/refresh');
        const newToken = data.access_token;
        
        localStorage.setItem('token', newToken);
        processQueue(null, newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        console.error('[API Auth] Refresh sequence failed, logging out:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login  = (email: string, password: string) => api.post('auth/login', { email, password });
export const logout = () => api.post('auth/logout');
export const getMe  = () => api.get('auth/me');
export const forgotPassword = (email: string) => api.post('auth/forgot-password', { email });
export const resetPassword = (data: object) => api.post('auth/reset-password', data);

// Projects
export const getProjects   = () => api.get('projects');
export const getProject    = (id: string | number) => api.get(`projects/${id}`);
export const createProject = (data: object) => api.post('projects', data);
export const updateProject = (id: number, data: object) => api.put(`projects/${id}`, data);
export const deleteProject = (id: number) => api.delete(`projects/${id}`);

// Skills
export const getSkills   = () => api.get('skills');
export const createSkill = (data: object) => api.post('skills', data);
export const updateSkill = (id: number, data: object) => api.put(`skills/${id}`, data);
export const deleteSkill = (id: number) => api.delete(`skills/${id}`);

// Experiences
export const getExperiences   = () => api.get('experiences');
export const createExperience = (data: object) => api.post('experiences', data);
export const updateExperience = (id: number, data: object) => api.put(`experiences/${id}`, data);
export const deleteExperience = (id: number) => api.delete(`experiences/${id}`);

// Messages
export const sendMessage   = (data: object) => api.post('messages', data);
export const getMessages   = () => api.get('messages');
export const markRead      = (id: number) => api.put(`messages/${id}/read`);
export const deleteMessage = (id: number) => api.delete(`messages/${id}`);

// --- Site Settings ---
export const getSettings = () => api.get('settings');
export const updateSettings = (settings: Record<string, string>) => api.post('settings', { settings });

// --- Blogs ---
export const getBlogs = () => api.get('blogs');
export const getBlog = (slug: string) => api.get(`blogs/${slug}`);
export const getAdminBlogs = () => api.get('admin/blogs');
export const createBlog = (data: object) => api.post('blogs', data);
export const updateBlog = (id: number, data: object) => api.put(`blogs/${id}`, data);
export const deleteBlog = (id: number) => api.delete(`blogs/${id}`);

// --- Comments ---
export const postComment = (blogId: number, data: object) => api.post(`blogs/${blogId}/comments`, data);
export const getCommentsByBlog = (blogId: number) => api.get(`blogs/${blogId}/comments`);
export const getAllComments = () => api.get('admin/comments');
export const approveComment = (id: number) => api.put(`comments/${id}/approve`);
export const deleteComment = (id: number) => api.delete(`comments/${id}`);

// --- File Uploads ---
export const uploadFile = (file: File, type: 'image' | 'video' = 'image') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  return api.post('upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export default api;
