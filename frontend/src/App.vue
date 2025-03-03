<template>
  <div id="app">
    <nav v-if="isLoggedIn" class="navbar">
      <router-link to="/">Главная</router-link> |
      <router-link to="/setup-2fa">Настройка 2FA</router-link> |
      <a href="#" @click.prevent="logout">Выйти</a>
    </nav>

    <div v-else class="auth-container">
      <div class="auth-buttons" v-if="!showRegister">
        <h2>Вход</h2>
        <form @submit.prevent="login">
          <input 
            v-model="loginForm.username" 
            type="text" 
            placeholder="Имя пользователя"
            required
          >
          <input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="Пароль"
            required
          >
          <button type="submit">Войти</button>
        </form>
        <p>
          Нет аккаунта? 
          <a href="#" @click.prevent="showRegister = true">Зарегистрироваться</a>
        </p>
      </div>

      <div class="auth-buttons" v-else>
        <h2>Регистрация</h2>
        <form @submit.prevent="register">
          <input 
            v-model="registerForm.username" 
            type="text" 
            placeholder="Имя пользователя"
            required
          >
          <input 
            v-model="registerForm.email" 
            type="email" 
            placeholder="Email"
            required
          >
          <input 
            v-model="registerForm.password" 
            type="password" 
            placeholder="Пароль"
            required
          >
          <button type="submit">Зарегистрироваться</button>
        </form>
        <p>
          Уже есть аккаунт? 
          <a href="#" @click.prevent="showRegister = false">Войти</a>
        </p>
      </div>
    </div>

    <router-view v-if="isLoggedIn"/>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      showRegister: false,
      loginForm: {
        username: '',
        password: ''
      },
      registerForm: {
        username: '',
        email: '',
        password: ''
      }
    }
  },
  computed: {
    isLoggedIn() {
      return this.$store.state.token !== null
    }
  },
  methods: {
    async login() {
      try {
        await this.$store.dispatch('login', this.loginForm)
        this.$router.push('/')
      } catch (error) {
        console.error('Login error:', error)
      }
    },
    async register() {
      try {
        await this.$store.dispatch('register', this.registerForm)
        this.showRegister = false
      } catch (error) {
        console.error('Registration error:', error)
      }
    },
    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/')
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.navbar {
  padding: 20px;
  background-color: #f8f9fa;
  margin-bottom: 20px;
}

.navbar a {
  color: #2c3e50;
  text-decoration: none;
  margin: 0 10px;
}

.navbar a:hover {
  color: #42b983;
}

.auth-container {
  max-width: 400px;
  margin: 60px auto;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.auth-buttons form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 20px 0;
}

input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #3aa876;
}

a {
  color: #42b983;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
