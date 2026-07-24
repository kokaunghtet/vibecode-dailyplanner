<script setup lang="ts">
import { ref } from 'vue'
import { Eye, EyeOff, Loader2 } from '@lucide/vue'

const props = defineProps<{
  title: string
  description: string
  confirmLabel?: string
  submitting?: boolean
}>()

const emit = defineEmits<{
  confirm: [password: string]
  cancel: []
}>()

const password = ref('')
const showPassword = ref(false)

function handleConfirm() {
  if (!password.value || props.submitting) return
  emit('confirm', password.value)
}

function handleCancel() {
  password.value = ''
  emit('cancel')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" @click.self="handleCancel">
    <div class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {{ props.title }}
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {{ props.description }}
      </p>

      <form @submit.prevent="handleConfirm" class="space-y-4">
        <div>
          <label for="reauth-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Current password
          </label>
          <div class="relative">
            <input
              id="reauth-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autofocus
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

        <slot name="extra" />

        <div class="flex items-center gap-3">
          <button
            type="submit"
            :disabled="props.submitting"
            class="flex-1 inline-flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            <Loader2 v-if="props.submitting" :size="16" class="animate-spin" />
            {{ props.submitting ? 'Please wait...' : (props.confirmLabel || 'Confirm') }}
          </button>
          <button
            type="button"
            :disabled="props.submitting"
            class="py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            @click="handleCancel"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
