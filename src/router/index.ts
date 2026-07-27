import { createRouter, createWebHistory } from 'vue-router'
import { useAuth, authReady } from '../composables/useAuth'
import { landingRouteName } from '../composables/usePreferences'

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
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/ProfileView.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/SettingsView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

declare global {
  interface Window {
    goatcounter?: { count: (opts?: { path?: string }) => void }
  }
}

// The count.js script's own onload handler tracks the first pageview;
// only fire manually for subsequent client-side route changes.
let isFirstNav = true
router.afterEach((to) => {
  if (isFirstNav) {
    isFirstNav = false
    return
  }
  window.goatcounter?.count({ path: to.fullPath })
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
    return { name: landingRouteName() }
  }
})

export default router
