<script setup lang="ts">
import { useAuth } from './composables/useAuth'

const { loading } = useAuth()
</script>

<template>
  <div v-if="loading" class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Daily Planner</h1>
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
      <p class="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
    </div>
  </div>
  <router-view v-else />
</template>
