import apiClient from './api-client';
import { User, Post, Document, Memory, ChatRoom, Event, Attendance, Grade, WebsiteConfig, Notification } from '../types';

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name: string; major?: string }) =>
    apiClient.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  getCurrentUser: () =>
    apiClient.get<User>('/auth/me'),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post('/auth/change-password', data),
  
  forgotPassword: (data: { email: string }) =>
    apiClient.post('/auth/forgot-password', data),
  
  resetPassword: (token: string, data: { password: string }) =>
    apiClient.post(`/auth/reset-password/${token}`, data)
};

// Users API
export const usersAPI = {
  getAll: () =>
    apiClient.get<User[]>('/users'),
  
  getById: (id: number) =>
    apiClient.get<User>(`/users/${id}`),
  
  update: (id: number, data: Partial<User>) =>
    apiClient.put<User>(`/users/${id}`, data),
  
  toggleLock: (id: number) =>
    apiClient.post(`/users/${id}/lock`),
  
  addBadge: (id: number, badgeId: string) =>
    apiClient.post(`/users/${id}/badges`, { badgeId }),
  
  removeBadge: (id: number, badgeId: string) =>
    apiClient.delete(`/users/${id}/badges/${badgeId}`),
  
  getStats: (id: number) =>
    apiClient.get(`/users/${id}/stats`)
};

// Posts API
export const postsAPI = {
  getAll: () =>
    apiClient.get<Post[]>('/posts'),
  
  getById: (id: number) =>
    apiClient.get<Post>(`/posts/${id}`),
  
  create: (data: Partial<Post>) =>
    apiClient.post<Post>('/posts', data),
  
  update: (id: number, data: Partial<Post>) =>
    apiClient.put<Post>(`/posts/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/posts/${id}`),
  
  vote: (id: number, isUpvote: boolean) =>
    apiClient.post(`/posts/${id}/vote`, { isUpvote }),
  
  togglePin: (id: number) =>
    apiClient.post(`/posts/${id}/pin`),
  
  addComment: (id: number, content: string) =>
    apiClient.post(`/posts/${id}/comments`, { content }),
  
  deleteComment: (postId: number, commentId: number) =>
    apiClient.delete(`/posts/${postId}/comments/${commentId}`)
};

// Documents API
export const documentsAPI = {
  getAll: () =>
    apiClient.get<Document[]>('/documents'),
  
  upload: (formData: FormData) =>
    apiClient.post<Document>('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  approve: (id: number) =>
    apiClient.post(`/documents/${id}/approve`),
  
  delete: (id: number) =>
    apiClient.delete(`/documents/${id}`)
};

// Memories API
export const memoriesAPI = {
  getAll: () =>
    apiClient.get<Memory[]>('/memories'),
  
  upload: (formData: FormData) =>
    apiClient.post<Memory>('/memories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  react: (id: number, emoji: string) =>
    apiClient.post(`/memories/${id}/react`, { emoji }),
  
  approve: (id: number) =>
    apiClient.post(`/memories/${id}/approve`),
  
  delete: (id: number) =>
    apiClient.delete(`/memories/${id}`)
};

// Chat API
export const chatAPI = {
  getRooms: () =>
    apiClient.get<ChatRoom[]>('/chat/rooms'),
  
  getMessages: (roomId: string) =>
    apiClient.get(`/chat/rooms/${roomId}/messages`)
};

// Events API
export const eventsAPI = {
  getAll: () =>
    apiClient.get<Event[]>('/events'),
  
  getById: (id: number) =>
    apiClient.get<Event>(`/events/${id}`),
  
  create: (data: Partial<Event>) =>
    apiClient.post<Event>('/events', data),
  
  update: (id: number, data: Partial<Event>) =>
    apiClient.put<Event>(`/events/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/events/${id}`),
  
  participate: (id: number, status: string) =>
    apiClient.post(`/events/${id}/participate`, { status })
};

// Attendance API
export const attendanceAPI = {
  get: () =>
    apiClient.get<Attendance[]>('/attendance'),
  
  checkIn: (data: { eventId?: number; notes?: string }) =>
    apiClient.post<Attendance>('/attendance/check-in', data),
  
  getReport: () =>
    apiClient.get('/attendance/report')
};

// Grades API
export const gradesAPI = {
  getAll: () =>
    apiClient.get<Grade[]>('/grades'),
  
  getById: (id: number) =>
    apiClient.get<Grade>(`/grades/${id}`),
  
  create: (data: Partial<Grade>) =>
    apiClient.post<Grade>('/grades', data),
  
  update: (id: number, data: Partial<Grade>) =>
    apiClient.put<Grade>(`/grades/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/grades/${id}`),
  
  import: (formData: FormData) =>
    apiClient.post('/grades/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  export: () =>
    apiClient.get('/grades/export', { responseType: 'blob' })
};

// Notifications API
export const notificationsAPI = {
  getAll: () =>
    apiClient.get<Notification[]>('/notifications'),
  
  markAsRead: (id: number) =>
    apiClient.put(`/notifications/${id}/read`),
  
  create: (data: { type: string; text: string; link?: string }) =>
    apiClient.post<Notification>('/notifications', data)
};

// Config API
export const configAPI = {
  get: () =>
    apiClient.get<WebsiteConfig>('/config'),
  
  update: (data: Partial<WebsiteConfig>) =>
    apiClient.put<WebsiteConfig>('/config', data)
};
