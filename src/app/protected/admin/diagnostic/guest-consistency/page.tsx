"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Simple interfaces to capture the exact structure of our data
interface ProfileData {
  email: string | null;
}

interface AttendeeData {
  email: string;
  event_id: string;
  invitation_id: string | null;
}

interface RsvpData {
  invitation_id: string;
  email: string;
}

interface InvitationData {
  id: string;
  email: string;
}

interface ConsistencyResult {
  email: string;
  profileExists: boolean;
  attendeeExists: boolean;
  rsvpExists: boolean;
  invitationExists: boolean;
  issues: string[];
  repaired?: boolean;
}

export default function GuestConsistencyPage() {
  const [results, setResults] = useState<ConsistencyResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  
  const supabase = createClient();

  async function runConsistencyCheck() {
    setIsLoading(true);
    setError(null);
    
    try {
      // Query profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("email")
        .not("email", "is", null);
      
      if (profilesError) throw new Error(`Error fetching profiles: ${profilesError.message}`);
      
      // Query attendees
      const { data: attendees, error: attendeesError } = await supabase
        .from("event_attendees")
        .select("email, event_id, invitation_id")
        .not("email", "is", null);
        
      if (attendeesError) throw new Error(`Error fetching attendees: ${attendeesError.message}`);
      
      // Query RSVPs
      const { data: rsvps, error: rsvpsError } = await supabase
        .from("rsvps")
        .select("invitation_id, email")
        .not("email", "is", null);
        
      if (rsvpsError) throw new Error(`Error fetching RSVPs: ${rsvpsError.message}`);
      
      // Query invitations
      const { data: invitations, error: invitationsError } = await supabase
        .from("invitations")
        .select("id, email")
        .not("email", "is", null);
        
      if (invitationsError) throw new Error(`Error fetching invitations: ${invitationsError.message}`);
      
      // Create email set from all sources
      const allEmails = new Set<string>();
      
      (profiles as any[])?.forEach(p => {
        if (p.email) allEmails.add(p.email.toLowerCase());
      });
      
      (attendees as any[])?.forEach(a => {
        if (a.email) allEmails.add(a.email.toLowerCase());
      });
      
      (rsvps as any[])?.forEach(r => {
        if (r.email) allEmails.add(r.email.toLowerCase());
      });
      
      (invitations as any[])?.forEach(i => {
        if (i.email) allEmails.add(i.email.toLowerCase());
      });
      
      // Build results
      const checkResults: ConsistencyResult[] = [];
      
      for (const email of allEmails) {
        if (!email) continue; // Skip empty emails
        
        const profilesForEmail = (profiles as any[])?.filter(p => p.email?.toLowerCase() === email) || [];
        const attendeesForEmail = (attendees as any[])?.filter(a => a.email?.toLowerCase() === email) || [];
        const rsvpsForEmail = (rsvps as any[])?.filter(r => r.email?.toLowerCase() === email) || [];
        const invitationsForEmail = (invitations as any[])?.filter(i => i.email?.toLowerCase() === email) || [];
        
        const issues: string[] = [];
        
        // Check for multiple profiles
        if (profilesForEmail.length > 1) {
          issues.push(`Multiple profiles (${profilesForEmail.length})`);
        }
        
        // Check for missing invitation_id in attendees
        const attendeesWithoutInvitation = attendeesForEmail.filter(a => !a.invitation_id);
        if (attendeesWithoutInvitation.length > 0) {
          issues.push(`${attendeesWithoutInvitation.length} attendee(s) missing invitation_id`);
        }
        
        // Check for attendees without corresponding profiles
        if (attendeesForEmail.length > 0 && profilesForEmail.length === 0) {
          issues.push("Attendee exists without profile");
        }
        
        checkResults.push({
          email,
          profileExists: profilesForEmail.length > 0,
          attendeeExists: attendeesForEmail.length > 0,
          rsvpExists: rsvpsForEmail.length > 0,
          invitationExists: invitationsForEmail.length > 0,
          issues,
        });
      }
      
      setResults(checkResults);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }
  
  async function repairInconsistencies() {
    setIsRepairing(true);
    setError(null);
    
    try {
      const repairedResults = [...results];
      
      for (let i = 0; i < repairedResults.length; i++) {
        const item = repairedResults[i];
        
        if (item.issues.length === 0) continue;
        
        // Create profile if attendee exists but profile doesn't
        if (item.attendeeExists && !item.profileExists) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({ email: item.email } as any);
            
          if (profileError) throw new Error(`Error creating profile for ${item.email}: ${profileError.message}`);
          
          repairedResults[i] = {
            ...item,
            profileExists: true,
            issues: item.issues.filter(issue => issue !== "Attendee exists without profile"),
            repaired: true
          };
        }
        
        // Fix attendees without invitation_id if invitation exists
        if (item.invitationExists && item.attendeeExists && item.issues.some(i => i.includes("missing invitation_id"))) {
          // Get invitation id
          const { data: invitationData, error: invitationError } = await supabase
            .from("invitations")
            .select("id")
            .eq("email", item.email as any)
            .limit(1);
            
          if (invitationError) throw new Error(`Error finding invitation for ${item.email}: ${invitationError.message}`);
          
          if (invitationData && invitationData.length > 0) {
            const invitationId = (invitationData[0] as any).id;
            
            if (invitationId) {
              // Update attendees
              const { error: updateError } = await supabase
                .from("event_attendees")
                .update({ invitation_id: invitationId } as any)
                .eq("email", item.email as any)
                .is("invitation_id", null);
                
              if (updateError) throw new Error(`Error updating attendees for ${item.email}: ${updateError.message}`);
              
              repairedResults[i] = {
                ...item,
                issues: item.issues.filter(issue => !issue.includes("missing invitation_id")),
                repaired: true
              };
            }
          }
        }
      }
      
      setResults(repairedResults);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsRepairing(false);
    }
  }
  
  const filteredResults = results.filter(result => {
    if (filter && !result.email.toLowerCase().includes(filter.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Guest Data Consistency Check</h1>
      
      <div className="flex gap-4 mb-8">
        <Button 
          onClick={runConsistencyCheck} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? <span className="animate-spin">⟳</span> : <Info className="h-4 w-4" />}
          Run Consistency Check
        </Button>
        
        <Button 
          onClick={repairInconsistencies} 
          disabled={isRepairing || results.length === 0}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isRepairing ? <span className="animate-spin">⟳</span> : <CheckCircle2 className="h-4 w-4" />}
          Repair Inconsistencies
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Emails</p>
              <p className="text-2xl font-bold">{results.length}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">With Issues</p>
              <p className="text-2xl font-bold">{results.filter(r => r.issues.length > 0).length}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Repaired</p>
              <p className="text-2xl font-bold">{results.filter(r => r.repaired).length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mb-6">
        <Input
          placeholder="Filter by email"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-xs"
        />
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Attendee</TableHead>
              <TableHead>RSVP</TableHead>
              <TableHead>Invitation</TableHead>
              <TableHead>Issues</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {results.length === 0 
                    ? "Run a consistency check to see results" 
                    : "No results match your filter"}
                </TableCell>
              </TableRow>
            ) : (
              filteredResults.map((result) => (
                <TableRow key={result.email}>
                  <TableCell className="font-medium">{result.email}</TableCell>
                  <TableCell>
                    {result.profileExists 
                      ? <CheckCircle2 className="h-4 w-4 text-green-500" /> 
                      : <AlertCircle className="h-4 w-4 text-red-500" />}
                  </TableCell>
                  <TableCell>
                    {result.attendeeExists 
                      ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                      : <AlertCircle className="h-4 w-4 text-amber-500" />}
                  </TableCell>
                  <TableCell>
                    {result.rsvpExists 
                      ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                      : <AlertCircle className="h-4 w-4 text-amber-500" />}
                  </TableCell>
                  <TableCell>
                    {result.invitationExists 
                      ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                      : <AlertCircle className="h-4 w-4 text-amber-500" />}
                  </TableCell>
                  <TableCell>
                    {result.issues.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {result.issues.map((issue, i) => (
                          <span key={i} className="text-xs text-red-500">{issue}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-green-500">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {result.repaired ? (
                      <Badge className="bg-green-500">Repaired</Badge>
                    ) : result.issues.length > 0 ? (
                      <Badge className="bg-red-500">Issues</Badge>
                    ) : (
                      <Badge variant="outline">OK</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 