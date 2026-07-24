<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useTodos } from '../composables/useTodos'
import { Check, Pencil, Loader2 } from '@lucide/vue'

const { user, updateDisplayName } = useAuth()
const { getAllTodos } = useTodos()

const editingName = ref(false)
const nameInput = ref('')
const savingName = ref(false)
const nameError = ref('')

const initial = computed(() => {
  const source = user.value?.displayName || user.value?.email || '?'
  return source.charAt(0).toUpperCase()
})

const memberSince = computed(() => {
  const created = user.value?.metadata?.creationTime
  if (!created) return null
  return new Date(created).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

function startEditName() {
  nameInput.value = user.value?.displayName || ''
  nameError.value = ''
  editingName.value = true
}

async function saveName() {
  const name = nameInput.value.trim()
  if (!name) {
    nameError.value = 'Name cannot be empty'
    return
  }
  savingName.value = true
  nameError.value = ''
  try {
    await updateDisplayName(name)
    editingName.value = false
  } catch (e: any) {
    nameError.value = e.message || 'Failed to update name'
  } finally {
    savingName.value = false
  }
}

// Stats
const statsLoading = ref(true)
const totalTasks = ref(0)
const completedTasks = ref(0)
const activeDays = ref(0)

const completionRate = computed(() =>
  totalTasks.value === 0 ? 0 : Math.round((completedTasks.value / totalTasks.value) * 100)
)

onMounted(async () => {
  statsLoading.value = true
  const all = await getAllTodos()
  totalTasks.value = all.length
  completedTasks.value = all.filter((t) => t.completed).length
  activeDays.value = new Set(all.map((t) => t.date)).size
  statsLoading.value = false
})
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
      Profile
    </h1>

    <!-- Account card -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-2xl font-semibold flex-shrink-0">
          {{ initial }}
        </div>

        <div class="flex-1 min-w-0">
          <div v-if="!editingName" class="flex items-center gap-2">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {{ user?.displayName || 'Add your name' }}
            </h2>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
              aria-label="Edit name"
              @click="startEditName"
            >
              <Pencil :size="14" />
            </button>
          </div>

          <form v-else @submit.prevent="saveName" class="flex items-center gap-2">
            <input
              v-model="nameInput"
              type="text"
              autofocus
              placeholder="Your name"
              class="min-w-0 flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              :disabled="savingName"
              class="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white"
            >
              <Loader2 v-if="savingName" :size="14" class="animate-spin" />
              <Check v-else :size="14" />
            </button>
            <button
              type="button"
              class="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              @click="editingName = false"
            >
              Cancel
            </button>
          </form>
          <p v-if="nameError" class="text-red-500 text-xs mt-1">{{ nameError }}</p>

          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
            {{ user?.email }}
          </p>

          <div class="flex items-center gap-2 mt-1 flex-wrap">
            <span
              v-if="user?.emailVerified"
              class="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400"
            >
              <Check :size="12" /> Verified
            </span>
            <span v-if="memberSince" class="text-xs text-gray-400 dark:text-gray-500">
              Member since {{ memberSince }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats card -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4">
        Your activity
      </h3>

      <div v-if="statsLoading" class="flex items-center justify-center py-6 text-gray-400 dark:text-gray-500">
        <Loader2 :size="20" class="animate-spin" />
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalTasks }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Total tasks</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ completedTasks }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ completionRate }}%</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Completion rate</p>
        </div>
        <div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ activeDays }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Active days</p>
        </div>
      </div>
    </div>
  </div>
</template>
