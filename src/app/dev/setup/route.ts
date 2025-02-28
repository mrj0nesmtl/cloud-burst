import { createTestUser } from '@/lib/supabase/test-utils'
import { NextResponse } from 'next/server'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not available in production', { status: 403 })
  }

  try {
    // Create test users with different roles
    await createTestUser('admin@test.com', 'admin')
    await createTestUser('host@test.com', 'event_host')
    await createTestUser('user@test.com', 'user')
    await createTestUser('guest@test.com', 'guest')

    return NextResponse.json({ 
      message: 'Test users created successfully',
      users: [
        'admin@test.com',
        'host@test.com',
        'user@test.com',
        'guest@test.com'
      ]
    })
  } catch (error) {
    console.error('Error creating test users:', error)
    return NextResponse.json({ error }, { status: 500 })
  }
} 