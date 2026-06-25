// Firebase Messaging Service Worker
// Config is injected at runtime via postMessage from the main app

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

let messaging = null

self.addEventListener('message', (event) => {
  if (event.data?.type === 'FIREBASE_CONFIG') {
    if (firebase.apps.length === 0) {
      firebase.initializeApp(event.data.config)
      messaging = firebase.messaging()

      messaging.onBackgroundMessage((payload) => {
        console.log('Background message received:', payload)

        const notificationTitle = payload.notification?.title || 'Daily Planner'
        const notificationOptions = {
          body: payload.notification?.body || 'You have tasks to complete!',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'daily-planner-notification',
          data: {
            url: payload.data?.click_action || '/',
          },
        }

        self.registration.showNotification(notificationTitle, notificationOptions)
      })
    }
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})
