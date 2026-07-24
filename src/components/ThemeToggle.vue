<script setup lang="ts">
import { useTheme } from '../composables/useTheme'
import { Sun, Moon } from '@lucide/vue'

const { theme, toggleTheme } = useTheme()
</script>

<template>
  <button
    @click="toggleTheme"
    :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    class="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
  >
    <Sun v-if="theme === 'dark'" :size="20" />
    <Moon v-else :size="20" />
  </button>
</template>
