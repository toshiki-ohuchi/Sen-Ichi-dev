import axios from 'axios'
import type { SalesRecord, SalesRecordInput, ListResponse, FilterValues, User } from '@/types'

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
  logout: () => api.post('/auth/logout'),
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
