import { ref } from 'vue'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth, authReady } from './useAuth'

export interface Todo {
  id: string
  text: string
  completed: boolean
  date: string
  createdAt: any
  updatedAt: any
}

const todos = ref<Todo[]>([])
const loading = ref(false)
const cache = new Map<string, Todo[]>()
let unsubscribe: (() => void) | null = null
let currentDate = ''
let currentUid = ''

export function useTodos() {
  const { user } = useAuth()

  async function subscribeToDate(date: string) {
    await authReady

    const uid = user.value?.uid ?? ''

    // Dedupe on both date AND uid — same date for a different user (e.g. after
    // logout/login while a listener from the previous user is still active)
    // must still resubscribe, otherwise stale/empty state sticks around.
    if (date === currentDate && uid === currentUid) return

    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    if (!user.value) {
      currentDate = ''
      currentUid = ''
      return
    }

    // Cache is keyed by date only, not uid — clear it on a user switch so
    // the new user never briefly sees the previous user's cached todos.
    if (uid !== currentUid) cache.clear()

    // Set guard state before the listener setup (not after) so a second call
    // that lands while this one is still mid-setup sees the update and bails
    // out instead of racing to install a second onSnapshot listener.
    currentDate = date
    currentUid = uid

    if (cache.has(date)) {
      todos.value = cache.get(date)!
      loading.value = false
    } else {
      todos.value = []
      loading.value = true
    }

    const todosRef = collection(db, 'users', user.value.uid, 'todos')
    const q = query(todosRef, where('date', '==', date), orderBy('createdAt', 'asc'))

    const activeUid = uid
    unsubscribe = onSnapshot(q, (snapshot) => {
      const result = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Todo)
      cache.set(date, result)
      if (currentDate === date && currentUid === activeUid) {
        todos.value = result
        loading.value = false
      }
    }, (err) => {
      console.error('Firestore query failed:', err)
      loading.value = false
    })
  }

  async function addTodo(text: string, date: string) {
    if (!user.value) return
    const todosRef = collection(db, 'users', user.value.uid, 'todos')
    await addDoc(todosRef, {
      text,
      completed: false,
      date,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  async function toggleTodo(todoId: string, completed: boolean) {
    if (!user.value) return
    const todoRef = doc(db, 'users', user.value.uid, 'todos', todoId)
    await updateDoc(todoRef, { completed, updatedAt: serverTimestamp() })
  }

  async function updateTodoText(todoId: string, text: string) {
    if (!user.value) return
    const todoRef = doc(db, 'users', user.value.uid, 'todos', todoId)
    await updateDoc(todoRef, { text, updatedAt: serverTimestamp() })
  }

  async function deleteTodo(todoId: string) {
    if (!user.value) return
    const todoRef = doc(db, 'users', user.value.uid, 'todos', todoId)
    await deleteDoc(todoRef)
  }

  async function getAllTodos(): Promise<Todo[]> {
    await authReady
    if (!user.value) return []
    const todosRef = collection(db, 'users', user.value.uid, 'todos')
    const snapshot = await getDocs(todosRef)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Todo)
  }

  function cleanup() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    currentDate = ''
    currentUid = ''
    cache.clear()
    todos.value = []
    loading.value = false
  }

  return { todos, loading, subscribeToDate, addTodo, toggleTodo, updateTodoText, deleteTodo, getAllTodos, cleanup }
}
