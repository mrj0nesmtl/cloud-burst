import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '../auth-store'

describe('Auth Store', () => {
  it('should handle sign in flow', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    await act(async () => {
      await result.current.signIn('test@test.com', 'password')
    })
    
    expect(result.current.user).toBeDefined()
    expect(result.current.capabilities).toHaveLength(1)
  })
}) 