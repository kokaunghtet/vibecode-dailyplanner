<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useNotifications } from '../composables/useNotifications'
import { usePreferences } from '../composables/usePreferences'
import ReauthModal from '../components/ReauthModal.vue'
import { Bell, Check, Loader2, LogOut, AlertTriangle } from '@lucide/vue'

const router = useRouter()
const { logout, changePassword, deleteAccount } = useAuth()
const { permission, requestPermission, isLoading: notifLoading, isSupported } = useNotifications()
const { weekStart, landingView, dateFormat } = usePreferences()

// --- Notifications ---
const notifSuccess = ref(false)
const notifDenied = ref(false)

async function handleEnableNotifications() {
  const result = await requestPermission()
  notifSuccess.value = result === 'granted'
  notifDenied.value = result === 'denied'
}

// --- Sign out ---
async function handleSignOut() {
  await logout()
  await router.push({ name: 'Login' })
}

// --- Change password (reauth flow) ---
const showPasswordModal = ref(false)
const newPassword = ref('')
const passwordSubmitting = ref(false)
const passwordError = ref('')
const passwordSuccess = ref(false)

function openPasswordModal() {
  newPassword.value = ''
  passwordError.value = ''
  passwordSuccess.value = false
  showPasswordModal.value = true
}

async function handlePasswordConfirm(currentPassword: string) {
  if (newPassword.value.length < 6) {
    passwordError.value = 'New password must be at least 6 characters'
    return
  }
  passwordSubmitting.value = true
  passwordError.value = ''
  try {
    await changePassword(currentPassword, newPassword.value)
    showPasswordModal.value = false
    passwordSuccess.value = true
  } catch (e: any) {
    passwordError.value = e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential'
      ? 'Current password is incorrect'
      : e.message || 'Failed to change password'
  } finally {
    passwordSubmitting.value = false
  }
}

// --- Delete account (reauth flow) ---
const showDeleteModal = ref(false)
const deleteSubmitting = ref(false)
const deleteError = ref('')

async function handleDeleteConfirm(currentPassword: string) {
  deleteSubmitting.value = true
  deleteError.value = ''
  try {
    await deleteAccount(currentPassword)
    await router.push({ name: 'Login' })
  } catch (e: any) {
    deleteError.value = e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential'
      ? 'Current password is incorrect'
      : e.message || 'Failed to delete account'
  } finally {
    deleteSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
      Settings
    </h1>

    <!-- Notifications -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Bell :size="18" />
        Notifications
      </h3>

      <div v-if="!isSupported" class="text-sm text-gray-500 dark:text-gray-400">
        Notifications are not supported in this browser.
      </div>

      <div v-else-if="permission === 'granted'" class="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
        <Check :size="16" />
        Notifications are enabled. Manage this anytime in your browser settings.
      </div>

      <div v-else-if="permission === 'denied'" class="text-sm text-red-500 dark:text-red-400">
        Notifications are blocked. Enable them in your browser settings to turn them back on.
      </div>

      <div v-else class="flex items-center gap-3">
        <button
          type="button"
          :disabled="notifLoading"
          class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
          @click="handleEnableNotifications"
        >
          <Loader2 v-if="notifLoading" :size="16" class="animate-spin" />
          {{ notifLoading ? 'Enabling...' : 'Enable Notifications' }}
        </button>
        <span v-if="notifDenied" class="text-sm text-red-500 dark:text-red-400">Permission denied</span>
      </div>
    </div>

    <!-- App preferences -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4">
        App preferences
      </h3>

      <div class="space-y-4">
        <div class="flex items-center justify-between gap-4">
          <label for="week-start" class="text-sm text-gray-700 dark:text-gray-300">Week starts on</label>
          <select
            id="week-start"
            v-model="weekStart"
            class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="sun">Sunday</option>
            <option value="mon">Monday</option>
          </select>
        </div>

        <div class="flex items-center justify-between gap-4">
          <label for="landing-view" class="text-sm text-gray-700 dark:text-gray-300">Default landing page</label>
          <select
            id="landing-view"
            v-model="landingView"
            class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="today">Today</option>
            <option value="calendar">Calendar</option>
          </select>
        </div>

        <div class="flex items-center justify-between gap-4">
          <label for="date-format" class="text-sm text-gray-700 dark:text-gray-300">Date format</label>
          <select
            id="date-format"
            v-model="dateFormat"
            class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="en-US">US (Month Day)</option>
            <option value="en-GB">UK (Day Month)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Account actions -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4">
        Account
      </h3>

      <div class="space-y-3">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-300">Password</p>
            <p v-if="passwordSuccess" class="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-0.5">
              <Check :size="12" /> Password updated
            </p>
          </div>
          <button
            type="button"
            class="px-3 py-1.5 text-sm font-medium rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            @click="openPasswordModal"
          >
            Change password
          </button>
        </div>

        <div class="flex items-center justify-between gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p class="text-sm text-gray-700 dark:text-gray-300">Sign out of your account</p>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            @click="handleSignOut"
          >
            <LogOut :size="14" />
            Sign out
          </button>
        </div>

        <!-- Danger zone -->
        <div class="flex items-center justify-between gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p class="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <AlertTriangle :size="14" />
              Delete account
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Permanently deletes your account and all tasks. This cannot be undone.
            </p>
          </div>
          <button
            type="button"
            class="flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            @click="showDeleteModal = true"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Change password modal -->
    <ReauthModal
      v-if="showPasswordModal"
      title="Change password"
      description="Enter your current password, then your new password."
      confirm-label="Change password"
      :submitting="passwordSubmitting"
      @confirm="handlePasswordConfirm"
      @cancel="showPasswordModal = false"
    >
      <template #extra>
        <div>
          <label for="new-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            New password
          </label>
          <input
            id="new-password"
            v-model="newPassword"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <p v-if="passwordError" class="text-red-500 text-sm mt-2">{{ passwordError }}</p>
      </template>
    </ReauthModal>

    <!-- Delete account modal -->
    <ReauthModal
      v-if="showDeleteModal"
      title="Delete account"
      description="This permanently deletes your account and all tasks. Enter your password to confirm."
      confirm-label="Delete my account"
      :submitting="deleteSubmitting"
      @confirm="handleDeleteConfirm"
      @cancel="showDeleteModal = false"
    >
      <template #extra>
        <p v-if="deleteError" class="text-red-500 text-sm">{{ deleteError }}</p>
      </template>
    </ReauthModal>
  </div>
</template>
