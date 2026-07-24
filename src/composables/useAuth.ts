import { ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
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

  async function updateDisplayName(name: string) {
    if (!auth.currentUser) throw new Error('Not authenticated')
    await updateProfile(auth.currentUser, { displayName: name })
    // updateProfile mutates auth.currentUser in place but doesn't trigger
    // onAuthStateChanged, so refresh the local ref to reflect the change.
    user.value = auth.currentUser
  }

  async function reauth(currentPassword: string) {
    if (!auth.currentUser?.email) throw new Error('Not authenticated')
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword)
    await reauthenticateWithCredential(auth.currentUser, credential)
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    if (!auth.currentUser) throw new Error('Not authenticated')
    await reauth(currentPassword)
    await updatePassword(auth.currentUser, newPassword)
  }

  async function deleteAccount(currentPassword: string) {
    if (!auth.currentUser) throw new Error('Not authenticated')
    await reauth(currentPassword)
    await deleteUser(auth.currentUser)
  }

  return {
    user,
    loading,
    register,
    login,
    logout,
    resetPassword,
    updateDisplayName,
    reauth,
    changePassword,
    deleteAccount,
  }
}

export { authReady }
