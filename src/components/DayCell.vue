<script setup lang="ts">
const props = defineProps<{
  date: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
}>()

const emit = defineEmits<{
  select: [date: string]
}>()
</script>

<template>
  <button
    type="button"
    class="flex items-center justify-center w-full aspect-square min-h-[40px] min-w-[40px] rounded-full text-sm transition-colors cursor-pointer"
    :class="[
      isSelected
        ? 'bg-blue-600 text-white'
        : isToday
          ? 'ring-2 ring-blue-600 text-gray-900 dark:text-white'
          : isCurrentMonth
            ? 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            : 'text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700',
    ]"
    @click="emit('select', props.date)"
  >
    {{ props.day }}
  </button>
</template>
