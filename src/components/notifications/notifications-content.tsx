"use client";

import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Mail, MessageSquare, Edit, Smartphone, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplatePreview } from "@/components/notifications/template-preview";
import { CreateTemplate } from "@/components/notifications/create-template";

// This would normally come from your database
const templates = [
  {
    id: "confirm-signup",
    name: "Confirm Sign Up",
    type: "email",
    active: true,
    lastUpdated: "2023-11-15",
    subject: "Confirm Your Cloud Burst Account",
    body: "Thank you for joining Cloud Burst! We're excited to have you on board.",
    path: "/protected/settings/notifications/templates/confirm-signup.html"
  },
  {
    id: "reset-password",
    name: "Reset Password",
    type: "email",
    active: true,
    lastUpdated: "2023-11-15",
    subject: "Reset Your Cloud Burst Password",
    body: "Follow this link to reset your password.",
    path: "/protected/settings/notifications/templates/reset-password.html"
  },
  {
    id: "magic-link",
    name: "Magic Link",
    type: "email",
    active: true,
    lastUpdated: "2023-11-15",
    subject: "Your Cloud Burst Magic Link",
    body: "Here's your magic link to sign in to Cloud Burst.",
    path: "/protected/settings/notifications/templates/magic-link.html"
  },
  {
    id: "change-email",
    name: "Change Email",
    type: "email",
    active: true,
    lastUpdated: "2023-11-15",
    subject: "Confirm Your Email Change",
    body: "Please confirm your email address change.",
    path: "/protected/settings/notifications/templates/change-email.html"
  },
  {
    id: "invite",
    name: "Invite",
    type: "email",
    active: true,
    lastUpdated: "2023-11-15",
    subject: "You're Invited to Join Cloud Burst",
    body: "You've been invited to join Cloud Burst.",
    path: "/protected/settings/notifications/templates/invite.html"
  },
  {
    id: "new-event",
    name: "New Event",
    type: "push",
    active: true,
    lastUpdated: "2023-11-10",
    subject: "New Event Created",
    body: "A new event has been created."
  },
  {
    id: "event-reminder",
    name: "Event Reminder",
    type: "sms",
    active: true,
    lastUpdated: "2023-11-05",
    subject: "Event Reminder",
    body: "Your event is coming up soon."
  }
];

export function NotificationsContent() {
  return (
    <div style={{ width: '100%', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }} className="flex justify-between items-center">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Notifications</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Manage your notification templates and settings
          </p>
        </div>
        <CreateTemplate />
      </div>

      <Tabs defaultValue="email" className="space-y-4">
        <TabsList>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="push">Push</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
        </TabsList>
        
        <TabsContent value="email" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>
                  Manage your email notification templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  Active email templates
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Delivery Rate</CardTitle>
                <CardDescription>
                  Email delivery success rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98.5%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Open Rate</CardTitle>
                <CardDescription>
                  Percentage of emails opened
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42.8%</div>
                <p className="text-xs text-muted-foreground">
                  +5.2% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
            <TemplatePreview />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="push" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Push Templates</CardTitle>
                <CardDescription>
                  Manage your push notification templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  Active push templates
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Delivery Rate</CardTitle>
                <CardDescription>
                  Push notification delivery rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">96.2%</div>
                <p className="text-xs text-muted-foreground">
                  +1.5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Interaction Rate</CardTitle>
                <CardDescription>
                  User interactions with push notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">38.4%</div>
                <p className="text-xs text-muted-foreground">
                  +3.7% from last month
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Push Notification Templates</CardTitle>
              <CardDescription>
                Coming soon: Manage your push notification templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Push notification template management is under development.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sms" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>SMS Templates</CardTitle>
                <CardDescription>
                  Manage your SMS notification templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  Active SMS templates
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Delivery Rate</CardTitle>
                <CardDescription>
                  SMS delivery success rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.1%</div>
                <p className="text-xs text-muted-foreground">
                  +0.3% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Response Rate</CardTitle>
                <CardDescription>
                  User responses to SMS notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24.7%</div>
                <p className="text-xs text-muted-foreground">
                  +1.2% from last month
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>SMS Notification Templates</CardTitle>
              <CardDescription>
                Coming soon: Manage your SMS notification templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                SMS template management is under development.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 