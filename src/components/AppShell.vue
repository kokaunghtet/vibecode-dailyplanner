<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ThemeToggle from './ThemeToggle.vue'
import NotificationPrompt from './NotificationPrompt.vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { Home, Calendar, LogOut, User, Settings } from '@lucide/vue'

const router = useRouter()
const { logout } = useAuth()

const userMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}

function closeUserMenu() {
  userMenuOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    closeUserMenu()
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

async function handleLogout() {
  closeUserMenu()
  await logout()
  await router.push({ name: 'Login' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Top Nav -->
    <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex-shrink-0">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Daily Planner</h1>
          </div>

          <!-- Desktop nav links -->
          <div class="hidden md:flex items-center space-x-4">
            <router-link
              to="/"
              class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              exact-active-class="!text-blue-600 dark:!text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Today
            </router-link>
            <router-link
              to="/calendar"
              class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              exact-active-class="!text-blue-600 dark:!text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Calendar
            </router-link>
          </div>

          <!-- Right side: theme + user -->
          <div class="flex items-center space-x-4">
            <ThemeToggle />

            <div class="relative" ref="userMenuRef">
              <button
                @click="toggleUserMenu"
                class="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <User :size="18" />
              </button>

              <div
                v-if="userMenuOpen"
                class="absolute right-0 mt-2 w-40 rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 overflow-hidden"
              >
                <button
                  @click="closeUserMenu"
                  class="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <User :size="16" />
                  Profile
                </button>
                <button
                  @click="closeUserMenu"
                  class="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Settings :size="16" />
                  Settings
                </button>
                <div class="my-1 border-t border-gray-200 dark:border-gray-700" />
                <button
                  @click="handleLogout"
                  class="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut :size="16" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Notification prompt -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      <NotificationPrompt />
    </div>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
      <router-view />
    </main>

    <!-- Mobile bottom nav -->
    <nav class="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div class="flex justify-around py-2">
        <router-link
          to="/"
          class="flex flex-col items-center px-3 py-1 rounded-md text-gray-600 dark:text-gray-400"
          exact-active-class="!text-blue-600 dark:!text-blue-400 bg-blue-50 dark:bg-blue-900/20"
        >
          <Home :size="20" />
          <span class="text-xs mt-0.5">Today</span>
        </router-link>
        <router-link
          to="/calendar"
          class="flex flex-col items-center px-3 py-1 rounded-md text-gray-600 dark:text-gray-400"
          exact-active-class="!text-blue-600 dark:!text-blue-400 bg-blue-50 dark:bg-blue-900/20"
        >
          <Calendar :size="20" />
          <span class="text-xs mt-0.5">Calendar</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>
