import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePermissions } from '../use-permissions'
import { useAuthStore } from '@/lib/supabase/auth-store'
import { resetStores } from '@/lib/test-utils'

describe('usePermissions', () => {
  beforeEach(() => {
    resetStores()
  })

  it('should check admin permissions correctly', () => {
    // Set up admin user
    useAuthStore.setState({
      user: { role: 'admin', id: '123', email: 'admin@test.com' },
      capabilities: ['manage:all']
    })

    const { result } = renderHook(() => usePermissions())

    expect(result.current.isAdmin()).toBe(true)
    expect(result.current.canManageEvents()).toBe(true)
  })

  it('should handle protected routes', () => {
    // Set up regular user
    useAuthStore.setState({
      user: { role: 'user', id: '123', email: 'user@test.com' },
      capabilities: ['upload:photos']
    })

    const { result } = renderHook(() => usePermissions())

    expect(result.current.canAccessRoute('/protected/admin')).toBe(false)
    expect(result.current.canUploadPhotos()).toBe(true)
  })
}) 