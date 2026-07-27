import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Firebase modules
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
}))

vi.mock('../firebase', () => ({
  db: { type: 'firestore' },
  auth: { currentUser: null },
}))

vi.mock('./useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { value: { uid: 'test-user-id' } },
    loading: { value: false },
  })),
  authReady: Promise.resolve(),
}))

describe('useTodos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports useTodos function', async () => {
    const { useTodos } = await import('./useTodos')
    expect(typeof useTodos).toBe('function')
  })

  it('returns expected interface', async () => {
    const { useTodos } = await import('./useTodos')
    const result = useTodos()
    expect(result).toHaveProperty('todos')
    expect(result).toHaveProperty('loading')
    expect(result).toHaveProperty('subscribeToDate')
    expect(result).toHaveProperty('addTodo')
    expect(result).toHaveProperty('toggleTodo')
    expect(result).toHaveProperty('updateTodoText')
    expect(result).toHaveProperty('deleteTodo')
    expect(result).toHaveProperty('cleanup')
  })

  it('todos is a ref with initial empty array', async () => {
    const { useTodos } = await import('./useTodos')
    const { todos } = useTodos()
    expect(todos.value).toEqual([])
  })

  it('loading is a ref with initial false', async () => {
    const { useTodos } = await import('./useTodos')
    const { loading } = useTodos()
    expect(loading.value).toBe(false)
  })

  it('subscribeToDate calls onSnapshot with correct query', async () => {
    const { onSnapshot, collection, query, where, orderBy } = await import('firebase/firestore')
    const { useTodos } = await import('./useTodos')

    const mockUnsubscribe = vi.fn()
    vi.mocked(onSnapshot).mockReturnValue(mockUnsubscribe)
    vi.mocked(collection).mockReturnValue('todosRef' as any)
    vi.mocked(query).mockReturnValue('queryRef' as any)
    vi.mocked(where).mockReturnValue('whereClause' as any)
    vi.mocked(orderBy).mockReturnValue('orderByClause' as any)

    const { subscribeToDate } = useTodos()
    await subscribeToDate('2026-06-25')

    expect(collection).toHaveBeenCalledWith({ type: 'firestore' }, 'users', 'test-user-id', 'todos')
    expect(where).toHaveBeenCalledWith('date', '==', '2026-06-25')
    expect(orderBy).toHaveBeenCalledWith('createdAt', 'asc')
    expect(onSnapshot).toHaveBeenCalled()
  })

  it('resubscribes when a different user logs in on the same date (regression: todos missing after re-login)', async () => {
    const { onSnapshot, collection } = await import('firebase/firestore')
    const { useAuth } = await import('./useAuth')
    const { useTodos } = await import('./useTodos')

    const unsubA = vi.fn()
    const unsubB = vi.fn()
    vi.mocked(onSnapshot).mockReturnValueOnce(unsubA).mockReturnValueOnce(unsubB)
    vi.mocked(collection).mockReturnValue('todosRef' as any)

    const mockedUseAuth = vi.mocked(useAuth)
    mockedUseAuth.mockReturnValue({
      user: { value: { uid: 'user-a' } },
      loading: { value: false },
    } as any)

    const { subscribeToDate: subscribeAsUserA } = useTodos()
    await subscribeAsUserA('2026-06-25')
    expect(onSnapshot).toHaveBeenCalledTimes(1)

    // same date, different (re-logged-in) user — must tear down A's listener
    // and install a fresh one, not silently no-op.
    mockedUseAuth.mockReturnValue({
      user: { value: { uid: 'user-b' } },
      loading: { value: false },
    } as any)
    const { subscribeToDate: subscribeAsUserB } = useTodos()
    await subscribeAsUserB('2026-06-25')

    expect(unsubA).toHaveBeenCalled()
    expect(onSnapshot).toHaveBeenCalledTimes(2)
    expect(collection).toHaveBeenLastCalledWith({ type: 'firestore' }, 'users', 'user-b', 'todos')

    // restore default mock so later tests aren't affected by this override
    mockedUseAuth.mockReturnValue({
      user: { value: { uid: 'test-user-id' } },
      loading: { value: false },
    } as any)
  })

  it('addTodo calls addDoc with correct data', async () => {
    const { addDoc, collection } = await import('firebase/firestore')
    const { useTodos } = await import('./useTodos')

    vi.mocked(addDoc).mockResolvedValue({ id: 'new-todo-id' } as any)
    vi.mocked(collection).mockReturnValue('todosRef' as any)

    const { addTodo } = useTodos()
    await addTodo('Buy groceries', '2026-06-25')

    expect(addDoc).toHaveBeenCalledWith('todosRef', {
      text: 'Buy groceries',
      completed: false,
      date: '2026-06-25',
      createdAt: 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
    })
  })

  it('toggleTodo calls updateDoc with completed status', async () => {
    const { updateDoc, doc } = await import('firebase/firestore')
    const { useTodos } = await import('./useTodos')

    vi.mocked(doc).mockReturnValue('todoRef' as any)
    vi.mocked(updateDoc).mockResolvedValue(undefined)

    const { toggleTodo } = useTodos()
    await toggleTodo('todo-123', true)

    expect(doc).toHaveBeenCalledWith({ type: 'firestore' }, 'users', 'test-user-id', 'todos', 'todo-123')
    expect(updateDoc).toHaveBeenCalledWith('todoRef', {
      completed: true,
      updatedAt: 'SERVER_TIMESTAMP',
    })
  })

  it('updateTodoText calls updateDoc with new text', async () => {
    const { updateDoc, doc } = await import('firebase/firestore')
    const { useTodos } = await import('./useTodos')

    vi.mocked(doc).mockReturnValue('todoRef' as any)
    vi.mocked(updateDoc).mockResolvedValue(undefined)

    const { updateTodoText } = useTodos()
    await updateTodoText('todo-123', 'Updated text')

    expect(updateDoc).toHaveBeenCalledWith('todoRef', {
      text: 'Updated text',
      updatedAt: 'SERVER_TIMESTAMP',
    })
  })

  it('deleteTodo calls deleteDoc', async () => {
    const { deleteDoc, doc } = await import('firebase/firestore')
    const { useTodos } = await import('./useTodos')

    vi.mocked(doc).mockReturnValue('todoRef' as any)
    vi.mocked(deleteDoc).mockResolvedValue(undefined)

    const { deleteTodo } = useTodos()
    await deleteTodo('todo-123')

    expect(doc).toHaveBeenCalledWith({ type: 'firestore' }, 'users', 'test-user-id', 'todos', 'todo-123')
    expect(deleteDoc).toHaveBeenCalledWith('todoRef')
  })

  it('cleanup unsubscribes from listener', async () => {
    const { onSnapshot } = await import('firebase/firestore')
    const { useTodos } = await import('./useTodos')

    const mockUnsubscribe = vi.fn()
    vi.mocked(onSnapshot).mockReturnValue(mockUnsubscribe)

    const { subscribeToDate, cleanup } = useTodos()
    await subscribeToDate('2026-06-25')
    cleanup()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
