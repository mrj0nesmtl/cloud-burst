// Test script for role-based access control
// Run this in the browser console when logged in as different roles

/**
 * Tests access to various pages based on the current user's role
 * This helps verify that role-based access control is working correctly
 */
async function testRBAC() {
  // Define test paths to check
  const testPaths = [
    { path: '/protected/dashboard', name: 'Dashboard' },
    { path: '/protected/events', name: 'Events List' },
    { path: '/protected/events/create', name: 'Create Event' },
    { path: '/protected/admin/events', name: 'Admin Events' },
    { path: '/protected/admin/photos', name: 'Admin Photos' },
    { path: '/protected/admin/users', name: 'User Management' },
    { path: '/protected/settings', name: 'Settings' },
    { path: '/protected/profile', name: 'Profile' }
  ];

  // Get current user info
  const userInfo = await fetchUserInfo();
  console.log('=== RBAC TEST RESULTS ===');
  console.log(`Current user: ${userInfo.email}`);
  console.log(`Role: ${userInfo.role}`);
  console.log('========================');
  
  // Test each path
  console.log('Testing access to pages:');
  for (const test of testPaths) {
    const result = await testAccess(test.path);
    console.log(`${test.name} (${test.path}): ${result ? '✅ Accessible' : '❌ Blocked'}`);
  }
  
  console.log('========================');
  console.log('Test complete. Check results against expected permissions for this role.');
}

/**
 * Fetches current user info from Supabase
 */
async function fetchUserInfo() {
  try {
    // This assumes Supabase client is available globally
    const supabase = window.supabase;
    if (!supabase) {
      return { email: 'Unknown', role: 'Unknown (Supabase client not found)' };
    }
    
    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { email: 'Not logged in', role: 'None' };
    }
    
    // Get profile with role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    return { 
      email: user.email, 
      role: profile?.role || 'Unknown' 
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    return { email: 'Error', role: 'Error' };
  }
}

/**
 * Tests if a path is accessible by making a fetch request
 */
async function testAccess(path) {
  try {
    // Make a fetch request to the path
    const response = await fetch(path, {
      method: 'HEAD',
      credentials: 'same-origin'
    });
    
    // If we get a 200 OK, the page is accessible
    // If we get redirected to login or 403/404, it's not
    return response.status === 200 && !response.redirected;
  } catch (error) {
    console.error(`Error testing ${path}:`, error);
    return false;
  }
}

// Run the test
testRBAC().catch(console.error);

// Instructions for manual testing
console.log(`
MANUAL TESTING INSTRUCTIONS:

1. Log in as each role:
   - super_admin: joel.yaffe@gmail.com
   - admin: joel.yaffe+admin@gmail.com
   - organizer: joel.yaffe+organizer@gmail.com
   - event_host: joel.yaffe+eventhost@gmail.com
   - user: joel.yaffe+user@gmail.com
   - guest: joel.yaffe+guest@gmail.com

2. Run this script in the browser console
3. Compare results with expected permissions
4. Check UI elements that should be visible/hidden
5. Test creating/editing events and photos
`); 