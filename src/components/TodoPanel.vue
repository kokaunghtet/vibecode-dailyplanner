<script setup lang="ts">
import { watch, onUnmounted, ref, computed } from 'vue'
import TodoItem from './TodoItem.vue'
import { useTodos } from '../composables/useTodos'
import { useAuth } from '../composables/useAuth'
import { formatDisplayDate } from '../utils/calendar'
import { usePreferences } from '../composables/usePreferences'
import { Sparkles, Loader2, Plus, AlertCircle, RotateCcw, Undo2 } from '@lucide/vue'

const props = defineProps<{
  selectedDate: string
}>()

const { dateFormat } = usePreferences()
const {
  todos,
  loading,
  error,
  subscribeToDate,
  retry,
  addTodo,
  toggleTodo,
  updateTodoText,
  scheduleDelete,
  undoDelete,
  cleanup,
} = useTodos()
const { user } = useAuth()

const newTodoText = ref('')
const addError = ref('')

const pendingDeletes = ref<Set<string>>(new Set())
const visibleTodos = computed(() => todos.value.filter((t) => !pendingDeletes.value.has(t.id)))

watch(
  () => props.selectedDate,
  (date) => {
    subscribeToDate(date)
  },
  { immediate: true }
)

// selectedDate often doesn't change across a logout/login (e.g. both land on
// "today"), so the date watcher alone won't refire — watch the user too or
// todos silently never (re)load after signing in.
watch(
  () => user.value?.uid,
  () => {
    subscribeToDate(props.selectedDate)
  }
)

onUnmounted(() => {
  cleanup()
})

async function handleAddTodo() {
  const text = newTodoText.value.trim()
  if (!text) return
  newTodoText.value = ''
  addError.value = ''
  try {
    await addTodo(text, props.selectedDate)
  } catch (e) {
    console.error('addTodo failed:', e)
    newTodoText.value = text
    addError.value = "Couldn't add that task. Try again."
  }
}

function handleRetry() {
  retry(props.selectedDate)
}

const DELETE_GRACE_MS = 5000

function handleDelete(todoId: string) {
  pendingDeletes.value.add(todoId)
  scheduleDelete(todoId, DELETE_GRACE_MS)
  // Mirrors the composable's internal timer so the snackbar clears itself once
  // the delete actually commits — otherwise "Task deleted / Undo" sticks around forever.
  setTimeout(() => {
    pendingDeletes.value.delete(todoId)
  }, DELETE_GRACE_MS)
}

function handleUndoDelete(todoId: string) {
  undoDelete(todoId)
  pendingDeletes.value.delete(todoId)
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-4">
      {{ formatDisplayDate(props.selectedDate, dateFormat) }}
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

    <p v-if="addError" role="alert" class="-mt-2 mb-4 text-sm text-red-600 dark:text-red-400">
      {{ addError }}
    </p>

    <!-- Error state: a failed listener previously fell through to the empty
         state, silently implying "you have no tasks" instead of "we couldn't load them" -->
    <div v-if="error" role="alert" class="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle :size="40" class="text-red-500 mb-3" />
      <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ error }}</p>
      <button
        type="button"
        class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        @click="handleRetry"
      >
        <RotateCcw :size="14" />
        Retry
      </button>
    </div>

    <!-- Loading state -->
    <div v-else-if="loading" class="flex flex-col items-center justify-center py-12">
      <Loader2 :size="32" class="animate-spin text-blue-600 mb-3" />
      <p class="text-sm text-gray-500 dark:text-gray-400">Loading todos...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="visibleTodos.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
      <Sparkles :size="40" class="text-gray-400 dark:text-gray-500 mb-3" />
      <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nothing planned yet</p>
      <p class="text-xs text-gray-500 dark:text-gray-400">Add a todo above to get started</p>
    </div>

    <!-- Todo list -->
    <div v-else class="flex flex-col">
      <TodoItem
        v-for="todo in visibleTodos"
        :key="todo.id"
        :todo="todo"
        @toggle="toggleTodo"
        @update="updateTodoText"
        @delete="handleDelete"
      />
    </div>

    <!-- Undo-delete snackbars -->
    <div v-if="pendingDeletes.size" class="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col gap-2">
      <div
        v-for="id in pendingDeletes"
        :key="id"
        class="flex items-center gap-3 px-4 py-2 rounded-md bg-gray-900 dark:bg-gray-700 text-white text-sm shadow-lg"
      >
        Task deleted
        <button
          type="button"
          class="inline-flex items-center gap-1 font-medium text-blue-300 hover:text-blue-200"
          @click="handleUndoDelete(id)"
        >
          <Undo2 :size="14" />
          Undo
        </button>
      </div>
    </div>
  </div>
</template>
