const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  'https://bxvbovzqzjfomnqidzzx.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkPolicies() {
  try {
    // First try to query the role_capabilities table directly
    console.log('Checking role_capabilities table access:');
    const { data: roleCapabilities, error: roleCapabilitiesError } = await supabase
      .from('role_capabilities')
      .select('*')
      .limit(5);
    
    if (roleCapabilitiesError) {
      console.error('Error accessing role_capabilities:', roleCapabilitiesError);
    } else {
      console.log('Role capabilities data:', roleCapabilities);
    }
    
    // Try to query the pg_policies table to get RLS policies
    console.log('\nChecking RLS policies:');
    try {
      const { data: policies, error: policiesError } = await supabase.rpc('get_policies');
      
      if (policiesError) {
        console.error('Error fetching policies via RPC:', policiesError);
        
        // Fallback to querying the information_schema
        console.log('\nTrying information_schema:');
        const { data: schemaData, error: schemaError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
        
        if (schemaError) {
          console.error('Error accessing information_schema:', schemaError);
        } else {
          console.log('Tables in public schema:', schemaData);
        }
      } else {
        console.log('Policies:', policies);
      }
    } catch (rpcErr) {
      console.error('RPC error:', rpcErr);
    }
  } catch (err) {
    console.error('General error:', err);
  }
}

checkPolicies(); 