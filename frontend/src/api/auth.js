import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

export default {
  login(credentials) {
    return axios.post(`${API_URL}/login/`, credentials)
  },
  register(userData) {
    return axios.post(`${API_URL}/register/`, userData)
  },
  generate2FASecret() {
    return axios.post(`${API_URL}/generate-2fa-secret/`)
  },
  verify2FA(token) {
    return axios.post(`${API_URL}/verify-2fa/`, { token })
  }
}
