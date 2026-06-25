import { ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User
} from 'firebase/auth'
import { auth } from '../firebase'

const user = ref<User | null>(null)
const loading = ref(true)
let authResolved: () => void
const authReady = new Promise<void>((resolve) => {
  authResolved = resolve
})

onAuthStateChanged(auth, (firebaseUser) => {
  user.value = firebaseUser
  loading.value = false
  authResolved()
})

export function useAuth() {
  async function register(email: string, password: string) {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    return credential.user
  }

  async function login(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return credential.user
  }

  async function logout() {
    await signOut(auth)
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email)
  }

  return { user, loading, register, login, logout, resetPassword }
}

export { authReady }
