import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Get columns for guests table using the new function
    const { data: guestsColumns, error: guestsError } = await supabase.rpc(
      'diagnose_columns',
      { table_name: 'guests' }
    );

    if (guestsError) {
      throw new Error(`Failed to get guests columns: ${guestsError.message}`);
    }

    // Get columns for invitations table
    const { data: invitationsColumns, error: invitationsError } = await supabase.rpc(
      'diagnose_columns',
      { table_name: 'invitations' }
    );

    // Get all tables in public schema
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (tablesError) {
      throw new Error(`Failed to get tables: ${tablesError.message}`);
    }

    return NextResponse.json({
      guests_columns: guestsColumns,
      invitations_columns: invitationsColumns || null,
      tables: tables?.map(t => t.tablename) || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Schema diagnostic error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 