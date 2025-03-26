import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/Home.vue'
import TwoFactorSetup from '@/components/TwoFactorSetup.vue'

const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/setup-2fa',
    name: 'TwoFactorSetup',
    component: TwoFactorSetup,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token')
  
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
