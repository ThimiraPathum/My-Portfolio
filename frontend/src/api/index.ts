import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? 'http://localhost:8000/api/' 
    : 'https://my-portfolio-api-20fo.onrender.com/api/');

export const API_URL = rawApiUrl.replace(/\/$/, '') + (rawApiUrl.includes('/api') ? '/' : '/api/');
export const BASE_URL = API_URL.split('/api')[0];

export const getSafeUrl = (url: string | null | undefined): string => {
  if (!url) return '';

  let sUrl = url;
  
  if (sUrl.startsWith('http')) {
    const markers = ['/storage/', '/uploads/'];
    for (const marker of markers) {
      if (sUrl.includes(marker)) {
        const parts = sUrl.split(marker);
        if (parts.length > 1) {
          sUrl = marker + parts.slice(1).join(marker);
          break;
        }
      }
    }
  }

  if (sUrl.startsWith('http')) return sUrl;
  
  const cleanPath = sUrl.replace(/^\/+/, '');
  const normalizedBase = BASE_URL.replace(/\/$/, '');
  
  return `${normalizedBase}/${cleanPath}`;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';

    if (url.includes('auth/refresh') && error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
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
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No existing token to refresh');

        const { data } = await api.post('auth/refresh');
        const newToken = data.access_token;
        
        localStorage.setItem('token', newToken);
        processQueue(null, newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
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
export const getSkills        = () => api.get('skills');
export const getDerivedSkills = () => api.get('skills/derived');
export const createSkill      = (data: object) => api.post('skills', data);
export const updateSkill      = (id: number, data: object) => api.put(`skills/${id}`, data);
export const deleteSkill      = (id: number) => api.delete(`skills/${id}`);

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
export const uploadFile = (
  file: File, 
  type: 'image' | 'video' | 'document' = 'image',
  onProgress?: (progress: number) => void
) => {
  const formData = new FormData();
  formData.append('file', file, file.name);
  formData.append('type', type);

  return api.post('upload', formData, {
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    }
  });
};

export default api;
