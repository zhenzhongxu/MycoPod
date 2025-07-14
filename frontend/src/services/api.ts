import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:4000/api/v1',
  withCredentials: true,
})

api.get('/ping').then(() => console.log('pong')).catch(() => {})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
