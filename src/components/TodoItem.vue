<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { Todo } from '../composables/useTodos'
import { X, Check } from '@lucide/vue'

const props = defineProps<{
  todo: Todo
}>()

const emit = defineEmits<{
  toggle: [todoId: string, completed: boolean]
  update: [todoId: string, text: string]
  delete: [todoId: string]
}>()

const isEditing = ref(false)
const editValue = ref('')
const editInput = ref<HTMLInputElement | null>(null)

function startEdit() {
  editValue.value = props.todo.text
  isEditing.value = true
  nextTick(() => {
    editInput.value?.focus()
  })
}

function saveEdit() {
  const trimmed = editValue.value.trim()
  if (trimmed && trimmed !== props.todo.text) {
    emit('update', props.todo.id, trimmed)
  }
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}
</script>

<template>
  <div class="group flex items-center gap-2 py-1.5">
    <!-- Checkbox -->
    <label class="relative flex-shrink-0 h-5 w-5 cursor-pointer">
      <input
        type="checkbox"
        :checked="props.todo.completed"
        class="sr-only peer"
        @change="emit('toggle', props.todo.id, !props.todo.completed)"
      />
      <div class="h-5 w-5 rounded border-2 border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 peer-checked:bg-blue-600 peer-checked:border-blue-600 dark:peer-checked:bg-blue-500 dark:peer-checked:border-blue-500 transition-colors flex items-center justify-center">
        <Check v-if="props.todo.completed" :size="12" class="text-white stroke-[3]" />
      </div>
    </label>

    <!-- Text / Edit input -->
    <span v-if="!isEditing" class="flex-1 text-sm cursor-pointer" :class="props.todo.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'" @click="startEdit">
      {{ props.todo.text }}
    </span>
    <input
      v-else
      ref="editInput"
      v-model="editValue"
      class="flex-1 text-sm border-b border-blue-500 outline-none bg-transparent text-gray-900 dark:text-white py-0.5"
      @keydown.enter="saveEdit"
      @keydown.escape="cancelEdit"
      @blur="saveEdit"
    />

    <!-- Delete button -->
    <button
      type="button"
      class="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400 p-1"
      aria-label="Delete todo"
      @click="emit('delete', props.todo.id)"
    >
      <X :size="16" />
    </button>
  </div>
</template>
