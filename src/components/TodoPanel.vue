<script setup lang="ts">
import { watch, onUnmounted, ref } from 'vue'
import TodoItem from './TodoItem.vue'
import { useTodos } from '../composables/useTodos'
import { formatDisplayDate } from '../utils/calendar'
import { Sparkles, Loader2, Plus } from '@lucide/vue'

const props = defineProps<{
  selectedDate: string
}>()

const { todos, loading, subscribeToDate, addTodo, toggleTodo, updateTodoText, deleteTodo, cleanup } = useTodos()

const newTodoText = ref('')

watch(
  () => props.selectedDate,
  (date) => {
    subscribeToDate(date)
  },
  { immediate: true }
)

onUnmounted(() => {
  cleanup()
})

async function handleAddTodo() {
  const text = newTodoText.value.trim()
  if (!text) return
  newTodoText.value = ''
  await addTodo(text, props.selectedDate)
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-4">
      {{ formatDisplayDate(props.selectedDate) }}
    </h2>

    <!-- Add todo input -->
    <div class="mb-4 flex gap-2">
      <input
        v-model="newTodoText"
        type="text"
        placeholder="Add a task..."
        class="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        @keydown.enter="handleAddTodo"
      />
      <button
        type="button"
        class="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        :disabled="!newTodoText.trim()"
        @click="handleAddTodo"
      >
        <Plus :size="16" />
        Add
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <Loader2 :size="32" class="animate-spin text-blue-600 mb-3" />
      <p class="text-sm text-gray-500 dark:text-gray-400">Loading todos...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="todos.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
      <Sparkles :size="40" class="text-gray-400 dark:text-gray-500 mb-3" />
      <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nothing planned yet</p>
      <p class="text-xs text-gray-500 dark:text-gray-400">Add a todo above to get started</p>
    </div>

    <!-- Todo list -->
    <div v-else class="flex flex-col">
      <TodoItem
        v-for="todo in todos"
        :key="todo.id"
        :todo="todo"
        @toggle="toggleTodo"
        @update="updateTodoText"
        @delete="deleteTodo"
      />
    </div>
  </div>
</template>
