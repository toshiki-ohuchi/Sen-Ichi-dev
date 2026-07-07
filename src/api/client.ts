import axios from 'axios'
import type { SalesRecord, SalesRecordInput, ListResponse, FilterValues, User, AppUser } from '@/types'

const api = axios.create({ baseURL: '/api', withCredentials: true })

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  me: () => api.get<User | null>('/auth/me').then(r => r.data),
  login: (email: string, password: string) => api.post<User>('/auth/login', { email, password }).then(r => r.data),
  logout: () => api.post('/auth/logout'),
}

export const usersApi = {
  list: () => api.get<AppUser[]>('/users').then(r => r.data),
  create: (data: { email: string; name: string; password: string; role: string }) =>
    api.post<AppUser>('/users', data).then(r => r.data),
  update: (id: number, data: { name?: string; role?: string; isActive?: boolean }) =>
    api.put<AppUser>(`/users/${id}`, data).then(r => r.data),
  resetPassword: (id: number, password: string) =>
    api.put(`/users/${id}/password`, { password }).then(r => r.data),
  unlock: (id: number) =>
    api.put(`/users/${id}/unlock`).then(r => r.data),
  delete: (id: number) =>
    api.delete(`/users/${id}`).then(r => r.data),
}

export const recordsApi = {
  list: (params: Record<string, string | number>) =>
    api.get<ListResponse>('/records', { params }).then(r => r.data),

  filters: () =>
    api.get<FilterValues>('/records/filters').then(r => r.data),

  get: (id: number) =>
    api.get<SalesRecord>(`/records/${id}`).then(r => r.data),

  create: (data: SalesRecordInput) =>
    api.post<SalesRecord>('/records', data).then(r => r.data),

  update: (id: number, data: Partial<SalesRecord>) =>
    api.put<SalesRecord>(`/records/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/records/${id}`).then(r => r.data),
}
