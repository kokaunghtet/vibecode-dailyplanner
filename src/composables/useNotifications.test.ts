import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Firebase messaging module
vi.mock('firebase/messaging', () => ({
  getMessaging: vi.fn(() => ({ type: 'messaging' })),
  getToken: vi.fn(),
  onMessage: vi.fn(),
}))

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
}))

// Mock Firebase app
vi.mock('../firebase', () => ({
  app: { name: '[DEFAULT]', options: {} },
  auth: { currentUser: null },
  db: { type: 'firestore' },
  messaging: { type: 'messaging' },
}))

// Mock useAuth
vi.mock('./useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { value: { uid: 'test-user-id' } },
    loading: { value: false },
  })),
}))

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset Notification mock
    vi.stubGlobal('Notification', {
      permission: 'default',
      requestPermission: vi.fn().mockResolvedValue('granted'),
    })
    // Mock env variable
    vi.stubEnv('VITE_FIREBASE_VAPID_KEY', 'test-vapid-key')
  })

  it('exports useNotifications function', async () => {
    const { useNotifications } = await import('./useNotifications')
    expect(typeof useNotifications).toBe('function')
  })

  it('returns expected interface', async () => {
    const { useNotifications } = await import('./useNotifications')
    const result = useNotifications()
    expect(result).toHaveProperty('permission')
    expect(result).toHaveProperty('token')
    expect(result).toHaveProperty('requestPermission')
    expect(result).toHaveProperty('isLoading')
    expect(result).toHaveProperty('isSupported')
  })

  it('permission ref tracks Notification.permission', async () => {
    const { useNotifications } = await import('./useNotifications')
    const { permission } = useNotifications()
    expect(permission.value).toBe('default')
  })

  it('isSupported is true when Notification exists in window', async () => {
    const { useNotifications } = await import('./useNotifications')
    const { isSupported } = useNotifications()
    expect(isSupported.value).toBe(true)
  })

  it('isSupported is false when Notification does not exist', async () => {
    vi.stubGlobal('Notification', undefined)
    const { useNotifications } = await import('./useNotifications')
    const { isSupported } = useNotifications()
    expect(isSupported.value).toBe(false)
  })

  it('requestPermission calls getToken with VAPID key', async () => {
    const { getToken } = await import('firebase/messaging')
    const { useNotifications } = await import('./useNotifications')

    vi.mocked(getToken).mockResolvedValue('test-fcm-token')

    const { requestPermission } = useNotifications()
    await requestPermission()

    expect(getToken).toHaveBeenCalledWith(
      { type: 'messaging' },
      { vapidKey: expect.any(String) }
    )
  })

  it('requestPermission stores token in Firestore', async () => {
    const { getToken } = await import('firebase/messaging')
    const { setDoc, doc } = await import('firebase/firestore')
    const { useNotifications } = await import('./useNotifications')

    vi.mocked(getToken).mockResolvedValue('test-fcm-token')
    vi.mocked(doc).mockReturnValue('tokenDocRef' as any)
    vi.mocked(setDoc).mockResolvedValue(undefined)

    const { requestPermission } = useNotifications()
    await requestPermission()

    expect(doc).toHaveBeenCalledWith(
      { type: 'firestore' },
      'users',
      'test-user-id',
      'fcm_tokens',
      'test-fcm-token'
    )
    expect(setDoc).toHaveBeenCalledWith('tokenDocRef', {
      createdAt: expect.anything(),
    })
  })

  it('requestPermission returns granted status', async () => {
    const { getToken } = await import('firebase/messaging')
    const { useNotifications } = await import('./useNotifications')

    vi.mocked(getToken).mockResolvedValue('test-fcm-token')

    const { requestPermission, permission } = useNotifications()
    const result = await requestPermission()

    expect(result).toBe('granted')
    expect(permission.value).toBe('granted')
  })

  it('requestPermission handles denied permission', async () => {
    vi.stubGlobal('Notification', {
      permission: 'default',
      requestPermission: vi.fn().mockResolvedValue('denied'),
    })

    const { useNotifications } = await import('./useNotifications')
    const { requestPermission, permission } = useNotifications()
    const result = await requestPermission()

    expect(result).toBe('denied')
    expect(permission.value).toBe('denied')
  })

  it('onMessage listener is registered for foreground notifications', async () => {
    const { onMessage, getToken } = await import('firebase/messaging')
    const { useNotifications } = await import('./useNotifications')

    vi.mocked(getToken).mockResolvedValue('test-fcm-token')
    vi.mocked(onMessage).mockReturnValue(() => {})

    const { requestPermission } = useNotifications()
    await requestPermission()

    expect(onMessage).toHaveBeenCalledWith(
      { type: 'messaging' },
      expect.any(Function)
    )
  })
})