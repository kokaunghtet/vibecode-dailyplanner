<script setup lang="ts">
import { useAuth } from '../composables/useAuth'

const { user } = useAuth()
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
      Welcome back!
    </h1>
    <p class="text-gray-600 dark:text-gray-400 mb-8">
      Signed in as {{ user?.email }}
    </p>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
      <div class="text-5xl mb-4">📅</div>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Calendar Coming Soon
      </h2>
      <p class="text-gray-500 dark:text-gray-400">
        Your daily planner calendar will appear here. Click any day to add todo items and get reminders.
      </p>
    </div>
  </div>
</template>
