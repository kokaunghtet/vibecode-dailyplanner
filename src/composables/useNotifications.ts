import { ref, computed } from 'vue'
import { getToken, onMessage } from 'firebase/messaging'
import { doc, setDoc } from 'firebase/firestore'
import { messaging, db } from '../firebase'
import { useAuth } from './useAuth'

const permission = ref<NotificationPermission>(
  typeof Notification !== 'undefined' ? Notification.permission : 'default'
)
const token = ref<string | null>(null)
const isLoading = ref(false)

export function useNotifications() {
  const { user } = useAuth()

  const isSupported = computed(() => typeof Notification !== 'undefined')

  async function requestPermission(): Promise<NotificationPermission> {
    if (!isSupported.value) {
      return 'denied'
    }

    isLoading.value = true
    try {
      const result = await Notification.requestPermission()
      permission.value = result

      if (result === 'granted') {
        // Send Firebase config to service worker so it never needs hardcoded values
        const swReg = await navigator.serviceWorker.ready
        swReg.active?.postMessage({
          type: 'FIREBASE_CONFIG',
          config: {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID,
          },
        })

        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
        const fcmToken = await getToken(messaging, { vapidKey })
        token.value = fcmToken

        // Store token in Firestore under user's fcm_tokens subcollection
        if (user.value) {
          const tokenRef = doc(db, 'users', user.value.uid, 'fcm_tokens', fcmToken)
          await setDoc(tokenRef, {
            createdAt: new Date(),
          })
        }

        // Set up foreground message listener
        onMessage(messaging, (payload) => {
          console.log('Foreground message received:', payload)
          // Display notification using the Notification API
          if (payload.notification) {
            new Notification(payload.notification.title || 'Daily Planner', {
              body: payload.notification.body,
              icon: '/favicon.ico',
            })
          }
        })
      }

      return result
    } finally {
      isLoading.value = false
    }
  }

  return {
    permission,
    token,
    requestPermission,
    isLoading,
    isSupported,
  }
}