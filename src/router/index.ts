import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/users',
      component: () => import('@/views/UsersView.vue'),
      meta: { adminOnly: true },
    },
  ],
})

router.beforeEach(async (to) => {
  if (to.meta.public) return true
  const auth = useAuthStore()
  if (auth.loading) await auth.fetchMe()
  if (!auth.user) return '/login'
  if (to.meta.adminOnly && auth.user.role !== 'admin') return '/'
})

export default router
