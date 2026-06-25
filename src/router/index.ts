import { createRouter, createWebHistory } from 'vue-router'
import { useAuth, authReady } from '../composables/useAuth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: () => import('../components/AppShell.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Today',
        component: () => import('../views/TodayView.vue')
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: () => import('../views/CalendarView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  await authReady

  const { user } = useAuth()

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  if (requiresAuth && !user.value) {
    return { name: 'Login' }
  }

  if (requiresGuest && user.value) {
    return { name: 'Today' }
  }
})

export default router
