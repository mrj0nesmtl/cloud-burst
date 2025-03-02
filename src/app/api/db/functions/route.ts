import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    // Check for a secret token to prevent unauthorized access
    const { searchParams } = new URL(request.url);
    const authToken = searchParams.get('token');
    
    if (authToken !== process.env.SETUP_SECRET_TOKEN) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Create the function to create the template_configurations table
    const createTableFunctionSQL = `
      CREATE OR REPLACE FUNCTION create_template_table()
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        CREATE TABLE IF NOT EXISTS template_configurations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          template_id TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('email', 'push', 'sms')),
          subject TEXT,
          body TEXT NOT NULL,
          html_content TEXT,
          active BOOLEAN DEFAULT TRUE,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
          synced_with_auth BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        CREATE INDEX IF NOT EXISTS idx_template_configurations_template_id ON template_configurations(template_id);
        CREATE INDEX IF NOT EXISTS idx_template_configurations_type ON template_configurations(type);
        
        ALTER TABLE template_configurations ENABLE ROW LEVEL SECURITY;
      END;
      $$;
    `;
    
    // Create the function to drop existing template policies
    const dropPoliciesFunctionSQL = `
      CREATE OR REPLACE FUNCTION drop_template_policies()
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        DROP POLICY IF EXISTS "Authenticated users can read template configurations" ON template_configurations;
        DROP POLICY IF EXISTS "template_configurations_read_policy" ON template_configurations;
        DROP POLICY IF EXISTS "Admins can manage template configurations" ON template_configurations;
        DROP POLICY IF EXISTS "template_configurations_admin_policy" ON template_configurations;
      END;
      $$;
    `;
    
    // Create the function to create the read policy
    const createReadPolicyFunctionSQL = `
      CREATE OR REPLACE FUNCTION create_template_read_policy()
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        CREATE POLICY "template_configurations_read_policy" 
          ON template_configurations
          FOR SELECT
          TO authenticated
          USING (true);
      END;
      $$;
    `;
    
    // Create the function to create the admin policy
    const createAdminPolicyFunctionSQL = `
      CREATE OR REPLACE FUNCTION create_template_admin_policy(user_id_column TEXT DEFAULT 'id')
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        policy_definition TEXT;
      BEGIN
        policy_definition := 'CREATE POLICY "template_configurations_admin_policy" 
          ON template_configurations
          FOR ALL
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.' || user_id_column || ' = auth.uid()
              AND profiles.role = ''admin''
            )
          )';
        
        EXECUTE policy_definition;
      END;
      $$;
    `;
    
    // Execute the SQL statements to create the functions
    const { error: createTableFunctionError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: createTableFunctionSQL 
    });
    
    if (createTableFunctionError) {
      console.error('Error creating table function:', createTableFunctionError);
      return NextResponse.json(
        { error: `Failed to create table function: ${createTableFunctionError.message}` },
        { status: 500 }
      );
    }
    
    const { error: dropPoliciesFunctionError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: dropPoliciesFunctionSQL 
    });
    
    if (dropPoliciesFunctionError) {
      console.error('Error creating drop policies function:', dropPoliciesFunctionError);
      return NextResponse.json(
        { error: `Failed to create drop policies function: ${dropPoliciesFunctionError.message}` },
        { status: 500 }
      );
    }
    
    const { error: createReadPolicyFunctionError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: createReadPolicyFunctionSQL 
    });
    
    if (createReadPolicyFunctionError) {
      console.error('Error creating read policy function:', createReadPolicyFunctionError);
      return NextResponse.json(
        { error: `Failed to create read policy function: ${createReadPolicyFunctionError.message}` },
        { status: 500 }
      );
    }
    
    const { error: createAdminPolicyFunctionError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: createAdminPolicyFunctionSQL 
    });
    
    if (createAdminPolicyFunctionError) {
      console.error('Error creating admin policy function:', createAdminPolicyFunctionError);
      return NextResponse.json(
        { error: `Failed to create admin policy function: ${createAdminPolicyFunctionError.message}` },
        { status: 500 }
      );
    }
    
    // Create the exec_sql function if it doesn't exist
    const createExecSqlFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `;
    
    // Execute the SQL to create the exec_sql function
    const { error: createExecSqlFunctionError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: createExecSqlFunctionSQL 
    });
    
    if (createExecSqlFunctionError && !createExecSqlFunctionError.message.includes('already exists')) {
      console.error('Error creating exec_sql function:', createExecSqlFunctionError);
      return NextResponse.json(
        { error: `Failed to create exec_sql function: ${createExecSqlFunctionError.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Database functions created successfully',
      functions: {
        create_template_table: !createTableFunctionError,
        drop_template_policies: !dropPoliciesFunctionError,
        create_template_read_policy: !createReadPolicyFunctionError,
        create_template_admin_policy: !createAdminPolicyFunctionError,
        exec_sql: !createExecSqlFunctionError || createExecSqlFunctionError.message.includes('already exists')
      }
    });
  } catch (error: any) {
    console.error('Error setting up database functions:', error);
    return NextResponse.json(
      { error: `Failed to set up database functions: ${error.message}` },
      { status: 500 }
    );
  }
} 