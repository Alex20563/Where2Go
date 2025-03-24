import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')  // Получаем токен из localStorage
  return {
    headers: {
      Authorization: `Token ${token}`  // Добавляем токен в заголовок
    }
  }
}

export default {
  async login(credentials) {
    return axios.post(`${API_URL}/login/`, credentials)
  },
  register(userData) {
    return axios.post(`${API_URL}/register/`, userData)
  },
  generate2FASecret() {
    return axios.post(`${API_URL}/generate-2fa-secret/`, {}, getAuthHeaders())  // Добавляем заголовки
  },
  updateUser(data) {
    return axios.post(`${API_URL}/update-user/`, data, getAuthHeaders())  // Добавляем заголовки
  }
}
