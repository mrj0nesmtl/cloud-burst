#!/usr/bin/env node

/**
 * Guest Profile Consistency Check Script
 * 
 * This script checks data consistency between the guests and event_attendees tables
 * and repairs any inconsistencies found.
 * 
 * Usage:
 *   node scripts/check-guest-consistency.mjs
 * 
 * Options:
 *   --dry-run      Check only, don't apply repairs
 *   --verbose      Show detailed logs
 *   --limit=100    Limit the number of records to check
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import ora from 'ora';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(chalk.red('Missing Supabase credentials. Please check your .env file.'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Stats tracking
const stats = {
  total: 0,
  consistent: 0,
  repaired: 0,
  failed: 0,
  skipped: 0,
};

/**
 * Check consistency for a single invitation
 */
async function checkInvitation(invitation) {
  if (verbose) {
    console.log(chalk.blue(`Checking invitation: ${invitation.id} (${invitation.email || 'No email'})`));
  }
  
  stats.total++;
  
  // Check if attendee exists
  const { data: attendees } = await supabase
    .from('event_attendees')
    .select('id, name, email, phone')
    .eq('invitation_id', invitation.id)
    .eq('event_id', invitation.event_id);
    
  const attendeeExists = attendees && attendees.length > 0;
  
  // Check if guest exists
  const { data: guests } = await supabase
    .from('guests')
    .select('id, name, email, phone')
    .eq('invitation_id', invitation.id)
    .eq('event_id', invitation.event_id);
    
  const guestExists = guests && guests.length > 0;
  
  // Check if repairs are needed
  const repairsNeeded = (attendeeExists && !guestExists) || (!attendeeExists && guestExists);
  
  if (!repairsNeeded) {
    stats.consistent++;
    return { invitation, consistent: true };
  }
  
  if (dryRun) {
    if (verbose) {
      console.log(chalk.yellow(`Inconsistency found for invitation ${invitation.id}. Would repair, but in dry-run mode.`));
    }
    stats.skipped++;
    return { invitation, consistent: false, skipped: true };
  }
  
  try {
    if (attendeeExists && !guestExists) {
      // Need to create guest from attendee
      const attendee = attendees[0];
      
      const { error } = await supabase
        .from('guests')
        .insert({
          invitation_id: invitation.id,
          event_id: invitation.event_id,
          name: attendee.name || invitation.name,
          email: attendee.email || invitation.email,
          phone: attendee.phone,
          access_token: crypto.randomUUID(),
          status: 'registered',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (error) {
        throw error;
      }
    }
    
    if (!attendeeExists && guestExists) {
      // Need to create attendee from guest
      const guest = guests[0];
      
      const { error } = await supabase
        .from('event_attendees')
        .insert({
          invitation_id: invitation.id,
          event_id: invitation.event_id,
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
          status: 'confirmed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (error) {
        throw error;
      }
    }
    
    stats.repaired++;
    if (verbose) {
      console.log(chalk.green(`Repaired inconsistency for invitation ${invitation.id}`));
    }
    return { invitation, consistent: false, repaired: true };
  } catch (error) {
    stats.failed++;
    console.error(chalk.red(`Failed to repair invitation ${invitation.id}: ${error.message}`));
    return { invitation, consistent: false, repaired: false, error };
  }
}

/**
 * Main function to run the script
 */
async function main() {
  console.log(chalk.bold(`Guest Profile Consistency Check`));
  console.log(chalk.grey(`Mode: ${dryRun ? 'Dry Run (no repairs)' : 'Repair'}`));
  console.log(chalk.grey(`Verbosity: ${verbose ? 'Verbose' : 'Standard'}`));
  if (limit) {
    console.log(chalk.grey(`Limit: ${limit} invitations`));
  }
  console.log('');
  
  const spinner = ora('Loading invitations...').start();
  
  try {
    // Get all invitations
    let query = supabase
      .from('invitations')
      .select('id, event_id, email, name')
      .order('created_at', { ascending: false });
      
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data: invitations, error } = await query;
    
    if (error) {
      throw error;
    }
    
    spinner.succeed(`Loaded ${invitations.length} invitations.`);
    
    // Start checking consistency
    spinner.text = 'Checking consistency...';
    spinner.start();
    
    let count = 0;
    for (const invitation of invitations) {
      await checkInvitation(invitation);
      count++;
      
      if (count % 10 === 0 || count === invitations.length) {
        spinner.text = `Checking consistency... ${count}/${invitations.length}`;
      }
    }
    
    spinner.succeed(`Finished checking ${invitations.length} invitations.`);
    
    // Print stats
    console.log('');
    console.log(chalk.bold('Results:'));
    console.log(`Total invitations checked: ${stats.total}`);
    console.log(`Consistent records: ${chalk.green(stats.consistent)}`);
    console.log(`Inconsistencies found: ${chalk.yellow(stats.total - stats.consistent)}`);
    console.log(`Repairs applied: ${chalk.green(stats.repaired)}`);
    console.log(`Repairs skipped (dry-run): ${chalk.blue(stats.skipped)}`);
    console.log(`Repairs failed: ${chalk.red(stats.failed)}`);
    
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

main(); 