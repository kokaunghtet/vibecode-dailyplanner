import { ref } from 'vue'
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
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

export function useTodos() {
  const { user } = useAuth()

  async function subscribeToDate(date: string) {
    await authReady

    if (date === currentDate) return

    if (unsubscribe) unsubscribe()
    if (!user.value) return

    currentDate = date

    if (cache.has(date)) {
      todos.value = cache.get(date)!
      loading.value = false
    } else {
      todos.value = []
      loading.value = true
    }

    const todosRef = collection(db, 'users', user.value.uid, 'todos')
    const q = query(todosRef, where('date', '==', date))

    unsubscribe = onSnapshot(q, (snapshot) => {
      const result = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as Todo)
        .sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
      cache.set(date, result)
      if (currentDate === date) {
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

  function cleanup() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    currentDate = ''
    cache.clear()
    todos.value = []
    loading.value = false
  }

  return { todos, loading, subscribeToDate, addTodo, toggleTodo, updateTodoText, deleteTodo, cleanup }
}
