<template>
  <div class="update-user">
    <h2>Изменение данных пользователя</h2>
    <form @submit.prevent="updateUser">
      <input 
        v-model="username" 
        type="text" 
        placeholder="Новое имя пользователя"
      />
      <input 
        v-model="password" 
        type="password" 
        placeholder="Новый пароль"
      />
      <button type="submit">Обновить данные</button>
    </form>
  </div>
</template>

<script>
import api from '@/api/auth'

export default {
  name: 'UpdateUser',
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    async updateUser() {
      try {
        await api.updateUser({ username: this.username, password: this.password })
        alert('Данные пользователя обновлены успешно.')
      } catch (error) {
        console.error('Error updating user:', error)
      }
    }
  }
}
</script>

<style scoped>
/* Ваши стили */
</style>
