import { createStore } from 'vuex'
import api from '@/api/auth'

export default createStore({
  state: {
    token: localStorage.getItem('token') || null,
    username: localStorage.getItem('username') || null
  },
  mutations: {
    setToken(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    setUsername(state, username) {
      state.username = username
      localStorage.setItem('username', username)
    },
    clearAuth(state) {
      state.token = null
      state.username = null
      localStorage.removeItem('token')
      localStorage.removeItem('username')
    }
  },
  actions: {
    async login({ commit }, credentials) {
      const response = await api.login(credentials)
      commit('setToken', response.data.token)
      commit('setUsername', credentials.username)
    },
    async register(_, userData) {
      await api.register(userData)
    },
    logout({ commit }) {
      commit('clearAuth')
    }
  }
})
