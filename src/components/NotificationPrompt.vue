<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotifications } from '../composables/useNotifications'
import { useAuth } from '../composables/useAuth'
import { Bell, X, Check, Loader2 } from '@lucide/vue'

const { permission, requestPermission, isLoading, isSupported } = useNotifications()
const { user } = useAuth()

const dismissed = ref(false)
const showSuccess = ref(false)
const showDenied = ref(false)

// Check if previously dismissed in localStorage
onMounted(() => {
  dismissed.value = localStorage.getItem('notification-prompt-dismissed') === 'true'
})

const shouldShow = computed(() => {
  return (
    user.value &&
    isSupported.value &&
    permission.value === 'default' &&
    !dismissed.value
  )
})

async function handleEnable() {
  const result = await requestPermission()

  if (result === 'granted') {
    showSuccess.value = true
    showDenied.value = false
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  } else if (result === 'denied') {
    showDenied.value = true
    showSuccess.value = false
  }
}

function handleDismiss() {
  dismissed.value = true
  localStorage.setItem('notification-prompt-dismissed', 'true')
}
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="shouldShow"
      class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 mb-4"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <Bell :size="18" class="text-blue-600 dark:text-blue-400" />
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
              Stay on track with notifications
            </h3>
          </div>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 ml-6">
            Get reminded about your tasks each day. We'll send you one notification per day showing how many tasks you have.
          </p>

          <!-- Success message -->
          <div
            v-if="showSuccess"
            class="mt-2 ml-6 text-sm text-green-600 dark:text-green-400 flex items-center gap-1"
          >
            <Check :size="16" />
            <span>Notifications enabled!</span>
          </div>

          <!-- Denied message -->
          <div
            v-if="showDenied"
            class="mt-2 ml-6 text-sm text-red-600 dark:text-red-400"
          >
            Notifications were blocked. You can enable them in browser settings.
          </div>

          <!-- Action buttons -->
          <div v-if="!showSuccess" class="mt-3 ml-6 flex items-center gap-3">
            <button
              @click="handleEnable"
              :disabled="isLoading"
              class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Loader2 v-if="isLoading" :size="16" class="animate-spin mr-2" />
              {{ isLoading ? 'Enabling...' : 'Enable Notifications' }}
            </button>
            <button
              @click="handleDismiss"
              class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>

        <!-- Close button -->
        <button
          @click="handleDismiss"
          class="flex-shrink-0 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <span class="sr-only">Dismiss</span>
          <X :size="20" />
        </button>
      </div>
    </div>
  </Transition>
</template>