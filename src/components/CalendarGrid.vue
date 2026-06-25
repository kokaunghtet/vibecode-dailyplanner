<script setup lang="ts">
import DayCell from './DayCell.vue'
import type { CalendarDay } from '../utils/calendar'

const props = defineProps<{
  monthGrid: CalendarDay[]
  selectedDate: string
}>()

const emit = defineEmits<{
  select: [date: string]
}>()

const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
</script>

<template>
  <div class="grid grid-cols-7 gap-1">
    <!-- Day-of-week headers -->
    <div
      v-for="day in dayHeaders"
      :key="day"
      class="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
    >
      {{ day }}
    </div>

    <!-- Day cells -->
    <DayCell
      v-for="(cell, index) in props.monthGrid"
      :key="index"
      :date="cell.date"
      :day="cell.day"
      :is-current-month="cell.isCurrentMonth"
      :is-today="cell.isToday"
      :is-selected="cell.date === props.selectedDate"
      @select="emit('select', $event)"
    />
  </div>
</template>
