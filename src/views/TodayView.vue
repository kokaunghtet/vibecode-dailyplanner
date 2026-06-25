<script setup lang="ts">
import { computed } from 'vue'
import TodoPanel from '../components/TodoPanel.vue'
import { formatDate } from '../utils/calendar'
import { Calendar } from '@lucide/vue'

const today = new Date()
const todayStr = formatDate(today)

const dayOfWeek = computed(() =>
  today.toLocaleDateString('en-US', { weekday: 'long' })
)
const monthAndDay = computed(() =>
  today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
)
const year = computed(() => today.getFullYear())
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <!-- Today's date header -->
    <div class="mb-8 text-center">
      <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
        {{ dayOfWeek }}
      </h1>
      <p class="text-lg text-gray-500 dark:text-gray-400 mt-1">
        {{ monthAndDay }}, {{ year }}
      </p>
    </div>

    <!-- Todo panel -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <TodoPanel :selected-date="todayStr" />
    </div>

    <!-- Calendar link -->
    <div class="mt-6 text-center">
      <router-link
        to="/calendar"
        class="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
      >
        <Calendar :size="16" />
        View Calendar
      </router-link>
    </div>
  </div>
</template>
