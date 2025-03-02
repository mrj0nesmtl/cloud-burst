'use client'

import * as z from 'zod'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { updateSecuritySettings } from '@/lib/security-settings'
import { getUserSessions, endSession, endAllOtherSessions } from '@/lib/user-sessions'
import type { UserSession } from '@/lib/user-sessions'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const securitySettingsSchema = z.object({
  enableTwoFactor: z.boolean(),
  autoLockSession: z.boolean(),
  sessionTimeout: z.enum(['15m', '30m', '1h', '4h', '8h']),
  loginNotifications: z.boolean(),
})

type PasswordFormValues = z.infer<typeof passwordSchema>
type SecuritySettingsValues = z.infer<typeof securitySettingsSchema>

interface SecurityFormProps {
  initialValues?: Partial<SecuritySettingsValues>
  onSecuritySettingsSubmit: (values: SecuritySettingsValues) => Promise<void>
}

export function SecurityForm({ initialValues, onSecuritySettingsSubmit }: SecurityFormProps) {
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [twoFactorSetupVisible, setTwoFactorSetupVisible] = useState(false)
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const securitySettingsForm = useForm<SecuritySettingsValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      enableTwoFactor: false,
      autoLockSession: false,
      sessionTimeout: '30m',
      loginNotifications: true,
      ...initialValues,
    },
  })

  useEffect(() => {
    async function loadSessions() {
      try {
        setIsLoadingSessions(true)
        const userSessions = await getUserSessions()
        setSessions(userSessions)
      } catch (error) {
        console.error('Error loading sessions:', error)
      } finally {
        setIsLoadingSessions(false)
      }
    }
    
    loadSessions()
  }, [])

  async function handlePasswordChange(data: PasswordFormValues) {
    try {
      setIsChangingPassword(true)
      
      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      })
      
      if (error) throw error
      
      setPasswordChangeStatus('success')
      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully.',
      })
      
      // Reset form
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      setPasswordChangeStatus('error')
      toast({
        title: 'Error',
        description: error.message || 'Failed to update password. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsChangingPassword(false)
      // Reset status after 5 seconds
      setTimeout(() => setPasswordChangeStatus('idle'), 5000)
    }
  }

  async function handleSecuritySettingsSubmit(data: SecuritySettingsValues) {
    try {
      // Convert the form values to the format expected by the API
      const settingsToUpdate = {
        enable_two_factor: data.enableTwoFactor,
        auto_lock_session: data.autoLockSession,
        session_timeout: data.sessionTimeout,
        login_notifications: data.loginNotifications,
      }
      
      // Update the settings in the database
      await updateSecuritySettings(settingsToUpdate)
      
      // If two-factor is enabled and wasn't before, show setup UI
      if (data.enableTwoFactor && !initialValues?.enableTwoFactor) {
        setTwoFactorSetupVisible(true)
      }
      
      toast({
        title: 'Security settings updated',
        description: 'Your security preferences have been saved successfully.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update security settings. Please try again.',
        variant: 'destructive',
      })
    }
  }

  async function handleSignOutSession(sessionId: string) {
    try {
      await endSession(sessionId)
      // Refresh the sessions list
      const userSessions = await getUserSessions()
      setSessions(userSessions)
      
      toast({
        title: 'Session ended',
        description: 'The session has been signed out successfully.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign out session. Please try again.',
        variant: 'destructive',
      })
    }
  }

  async function handleSignOutAllOtherSessions() {
    try {
      await endAllOtherSessions()
      // Refresh the sessions list
      const userSessions = await getUserSessions()
      setSessions(userSessions)
      
      toast({
        title: 'All other sessions ended',
        description: 'All other sessions have been signed out successfully.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign out all other sessions. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          {passwordChangeStatus === 'success' && (
            <Alert className="mb-4 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your password has been updated successfully.
              </AlertDescription>
            </Alert>
          )}
          
          {passwordChangeStatus === 'error' && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                There was a problem updating your password. Please try again.
              </AlertDescription>
            </Alert>
          )}
          
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Password must be at least 8 characters long
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Configure additional security options for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...securitySettingsForm}>
            <form onSubmit={securitySettingsForm.handleSubmit(handleSecuritySettingsSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={securitySettingsForm.control}
                  name="enableTwoFactor"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                        <FormDescription>
                          Add an extra layer of security to your account
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {twoFactorSetupVisible && (
                  <Alert className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Set up Two-Factor Authentication</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">Scan the QR code below with your authenticator app:</p>
                      <div className="bg-white p-4 inline-block rounded">
                        {/* Placeholder for QR code */}
                        <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
                          QR Code
                        </div>
                      </div>
                      <div className="mt-4">
                        <Input 
                          type="text" 
                          placeholder="Enter verification code" 
                          className="max-w-xs mb-2" 
                        />
                        <Button variant="secondary" size="sm">Verify</Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                <FormField
                  control={securitySettingsForm.control}
                  name="autoLockSession"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto-lock Session</FormLabel>
                        <FormDescription>
                          Automatically lock your session after a period of inactivity
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={securitySettingsForm.control}
                  name="loginNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Login Notifications</FormLabel>
                        <FormDescription>
                          Receive email notifications for new login attempts
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit">Save Security Settings</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage your active login sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSessions ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="rounded-lg border p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        {session.is_current ? 'Current Session' : session.device_info.device?.type || 'Unknown Device'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {session.device_info.browser?.name || 'Unknown'} on {session.device_info.os?.name || 'Unknown'} • 
                        Last active {new Date(session.last_active).toLocaleString()}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={session.is_current}
                      onClick={() => session.is_current ? null : handleSignOutSession(session.session_id)}
                    >
                      {session.is_current ? 'Current' : 'Sign Out'}
                    </Button>
                  </div>
                </div>
              ))}
              
              {sessions.length > 1 && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleSignOutAllOtherSessions}
                >
                  Sign Out All Other Sessions
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 