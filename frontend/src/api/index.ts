import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
// Remove trailing /api if present to get the root URL for images
export const BASE_URL = API_URL.replace(/\/api$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('token');
        if (!refreshToken) throw new Error('No token');
        const { data } = await api.post('/auth/refresh');
        localStorage.setItem('token', data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login  = (email: string, password: string) => api.post('/auth/login', { email, password });
export const logout = () => api.post('/auth/logout');
export const getMe  = () => api.get('/auth/me');

// Projects
export const getProjects   = () => api.get('/projects');
export const createProject = (data: object) => api.post('/projects', data);
export const updateProject = (id: number, data: object) => api.put(`/projects/${id}`, data);
export const deleteProject = (id: number) => api.delete(`/projects/${id}`);

// Skills
export const getSkills   = () => api.get('/skills');
export const createSkill = (data: object) => api.post('/skills', data);
export const updateSkill = (id: number, data: object) => api.put(`/skills/${id}`, data);
export const deleteSkill = (id: number) => api.delete(`/skills/${id}`);

// Experiences
export const getExperiences   = () => api.get('/experiences');
export const createExperience = (data: object) => api.post('/experiences', data);
export const deleteExperience = (id: number) => api.delete(`/experiences/${id}`);

// Messages
export const sendMessage   = (data: object) => api.post('/messages', data);
export const getMessages   = () => api.get('/messages');
export const markRead      = (id: number) => api.put(`/messages/${id}/read`);
export const deleteMessage = (id: number) => api.delete(`/messages/${id}`);

// --- Site Settings ---
export const getSettings = () => api.get('/settings');
export const updateSettings = (settings: Record<string, string>) => api.post('/settings', { settings });

// --- Blogs ---
export const getBlogs = () => api.get('/blogs');
export const getBlog = (slug: string) => api.get(`/blogs/${slug}`);
export const getAdminBlogs = () => api.get('/admin/blogs');
export const createBlog = (data: object) => api.post('/blogs', data);
export const updateBlog = (id: number, data: object) => api.put(`/blogs/${id}`, data);
export const deleteBlog = (id: number) => api.delete(`/blogs/${id}`);

// --- Comments ---
export const postComment = (blogId: number, data: object) => api.post(`/blogs/${blogId}/comments`, data);
export const getCommentsByBlog = (blogId: number) => api.get(`/blogs/${blogId}/comments`);
export const getAllComments = () => api.get('/admin/comments');
export const approveComment = (id: number) => api.put(`/comments/${id}/approve`);
export const deleteComment = (id: number) => api.delete(`/comments/${id}`);

// --- File Uploads ---
export const uploadFile = (file: File, type: 'image' | 'video' = 'image') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export default api;
