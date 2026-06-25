<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { Eye, EyeOff } from '@lucide/vue'

const router = useRouter()
const { register, login, resetPassword } = useAuth()

type Mode = 'login' | 'register' | 'forgot'

const mode = ref<Mode>('login')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

function clearMessages() {
  error.value = ''
  success.value = ''
}

async function handleSubmit() {
  clearMessages()
  loading.value = true

  try {
    if (mode.value === 'login') {
      await login(email.value, password.value)
      await router.push({ name: 'Today' })
    } else if (mode.value === 'register') {
      if (password.value !== confirmPassword.value) {
        error.value = 'Passwords do not match'
        return
      }
      if (password.value.length < 6) {
        error.value = 'Password must be at least 6 characters'
        return
      }
      await register(email.value, password.value)
      await router.push({ name: 'Today' })
    } else if (mode.value === 'forgot') {
      await resetPassword(email.value)
      success.value = 'Check your email for a password reset link'
    }
  } catch (e: any) {
    const code = e.code || ''
    switch (code) {
      case 'auth/invalid-email':
        error.value = 'Invalid email address'
        break
      case 'auth/user-not-found':
        error.value = 'No account found with this email'
        break
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        error.value = 'Invalid email or password'
        break
      case 'auth/email-already-in-use':
        error.value = 'An account already exists with this email'
        break
      case 'auth/weak-password':
        error.value = 'Password is too weak'
        break
      case 'auth/too-many-requests':
        error.value = 'Too many attempts. Please try again later'
        break
      default:
        error.value = e.message || 'An error occurred'
    }
  } finally {
    loading.value = false
  }
}

function setMode(newMode: Mode) {
  mode.value = newMode
  clearMessages()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h1 class="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Daily Planner
        </h1>
        <p class="text-center text-gray-500 dark:text-gray-400 mb-8">
          {{ mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create your account' : 'Reset your password' }}
        </p>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="you@example.com"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div v-if="mode !== 'forgot'">
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>
          </div>

          <div v-if="mode === 'register'">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <EyeOff v-if="showConfirmPassword" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>
          </div>

          <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
          <p v-if="success" class="text-green-500 text-sm text-center">{{ success }}</p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            {{ loading ? 'Loading...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm">
          <button
            v-if="mode === 'login'"
            @click="setMode('forgot')"
            class="text-blue-600 dark:text-blue-400 hover:underline mb-4 block w-full"
          >
            Forgot password?
          </button>

          <p class="text-gray-500 dark:text-gray-400">
            <template v-if="mode === 'login'">
              Don't have an account?
              <button @click="setMode('register')" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Sign up
              </button>
            </template>
            <template v-else>
              Already have an account?
              <button @click="setMode('login')" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Sign in
              </button>
            </template>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
