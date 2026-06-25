<script setup lang="ts">
import { ref, computed } from 'vue'
import CalendarGrid from '../components/CalendarGrid.vue'
import TodoPanel from '../components/TodoPanel.vue'
import { getMonthGrid, formatDate } from '../utils/calendar'

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())
const selectedDate = ref(formatDate(today))

const monthGrid = computed(() => getMonthGrid(currentYear.value, currentMonth.value))

const monthLabel = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function goToToday() {
  const now = new Date()
  currentYear.value = now.getFullYear()
  currentMonth.value = now.getMonth()
  selectedDate.value = formatDate(now)
}

function handleSelect(dateStr: string) {
  selectedDate.value = dateStr
  // Navigate to the month of the selected date if from another month
  const parts = dateStr.split('-')
  const selYear = parseInt(parts[0])
  const selMonth = parseInt(parts[1]) - 1
  if (selYear !== currentYear.value || selMonth !== currentMonth.value) {
    currentYear.value = selYear
    currentMonth.value = selMonth
  }
}
</script>

<template>
  <div class="flex flex-col md:flex-row gap-0 md:gap-6">
    <!-- Calendar section -->
    <div class="flex-1 min-w-0">
      <!-- Month header -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ monthLabel }}
        </h2>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            aria-label="Previous month"
            @click="prevMonth"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            class="px-3 py-1 text-sm font-medium rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            @click="goToToday"
          >
            Today
          </button>
          <button
            type="button"
            class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            aria-label="Next month"
            @click="nextMonth"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Calendar grid -->
      <CalendarGrid
        :month-grid="monthGrid"
        :selected-date="selectedDate"
        @select="handleSelect"
      />
    </div>

    <!-- Todo panel -->
    <div class="mt-4 md:mt-0 w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
      <TodoPanel :selected-date="selectedDate" />
    </div>
  </div>
</template>
