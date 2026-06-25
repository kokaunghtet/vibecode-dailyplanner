import { describe, it, expect, vi } from 'vitest'

// Mock Firebase modules before importing
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({ type: 'firestore' })),
}))

vi.mock('firebase/messaging', () => ({
  getMessaging: vi.fn(() => ({ type: 'messaging' })),
}))

describe('firebase.ts', () => {
  it('exports auth from getAuth', async () => {
    const { auth } = await import('./firebase')
    expect(auth).toBeDefined()
  })

  it('exports db from getFirestore', async () => {
    const { db } = await import('./firebase')
    expect(db).toBeDefined()
  })

  it('exports messaging from getMessaging', async () => {
    const { messaging } = await import('./firebase')
    expect(messaging).toBeDefined()
  })
})
