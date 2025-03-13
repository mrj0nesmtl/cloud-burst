import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, CreditCard, Download, FileText, Info, Package, PlusCircle, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export const metadata: Metadata = {
  title: 'Subscription | Cloud Burst',
  description: 'Manage your subscription and billing',
}

export default async function SubscriptionPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/signin')
  }

  // Mock subscription data (in a real application, would come from the database)
  const subscription = {
    plan: 'Pro',
    status: 'active',
    renewalDate: 'April 15, 2024',
    billingCycle: 'monthly',
    amount: '$19.99',
    storage: {
      total: '50 GB',
      used: '12.3 GB',
      percent: 24.6,
    },
    features: [
      'Unlimited events',
      '50 GB storage',
      'Priority support',
      'Custom branding',
      'Advanced analytics',
      'API access',
    ],
    paymentMethod: {
      type: 'credit_card',
      last4: '4242',
      expiry: '06/2025',
      brand: 'Visa',
    },
    invoices: [
      {
        id: 'INV-001',
        date: 'March 15, 2024',
        amount: '$19.99',
        status: 'paid',
      },
      {
        id: 'INV-002',
        date: 'February 15, 2024',
        amount: '$19.99',
        status: 'paid',
      },
      {
        id: 'INV-003',
        date: 'January 15, 2024',
        amount: '$19.99',
        status: 'paid',
      },
    ],
  };

  // Mock subscription plans
  const plans = [
    {
      name: 'Free',
      price: '$0',
      billing: '/month',
      description: 'Basic features for personal use',
      features: [
        '3 events per month',
        '5 GB storage',
        'Basic support',
        'Standard upload speed',
      ],
      isPopular: false,
      isCurrent: false,
    },
    {
      name: 'Pro',
      price: '$19.99',
      billing: '/month',
      description: 'Everything needed for professional events',
      features: [
        'Unlimited events',
        '50 GB storage',
        'Priority support',
        'Custom branding',
        'Advanced analytics',
        'API access',
      ],
      isPopular: true,
      isCurrent: true,
    },
    {
      name: 'Enterprise',
      price: '$49.99',
      billing: '/month',
      description: 'Advanced features for businesses',
      features: [
        'Unlimited events',
        '500 GB storage',
        '24/7 priority support',
        'Custom domain',
        'Advanced security',
        'Team management',
        'Dedicated account manager',
      ],
      isPopular: false,
      isCurrent: false,
    },
  ];

  return (
    <div style={{ width: '100%', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Subscription</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Manage your subscription plans and billing
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your subscription details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-2xl font-bold">{subscription.plan}</h3>
                      <Badge variant="outline" className="rounded-full uppercase text-xs font-semibold">
                        {subscription.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">Renews on {subscription.renewalDate}</p>
                  </div>
                  <div>
                    <span className="text-3xl font-bold">{subscription.amount}</span>
                    <span className="text-muted-foreground">/{subscription.billingCycle}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Plan Features</h4>
                  <ul className="space-y-2">
                    {subscription.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2 items-start">
                <Button variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Change Plan
                </Button>
                <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                  Cancel Subscription
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Storage Usage</CardTitle>
                <CardDescription>Your current storage usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {subscription.storage.used} of {subscription.storage.total} used
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {subscription.storage.percent}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${subscription.storage.percent}%` }}
                    />
                  </div>
                </div>
                
                <div className="border rounded-md p-4 bg-muted/10">
                  <div className="flex items-start space-x-2">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-sm">Need more storage?</h4>
                      <p className="text-xs text-muted-foreground">
                        You can upgrade your plan or purchase additional storage to add to your current plan.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Purchase Additional Storage
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Your current payment method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="border rounded-md p-3 flex-shrink-0">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">
                    {subscription.paymentMethod.brand} •••• {subscription.paymentMethod.last4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {subscription.paymentMethod.expiry}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                Update Payment Method
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="plans" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.isPopular ? 'border-primary' : ''}`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/3">
                    <Badge variant="default" className="rounded-full px-3 py-1">
                      Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-baseline">
                    <span>{plan.name}</span>
                    {plan.isCurrent && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Current
                      </Badge>
                    )}
                  </CardTitle>
                  <div>
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.billing}</span>
                  </div>
                  <CardDescription>
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Features</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="text-green-500 h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={plan.isCurrent ? "outline" : "default"}
                    disabled={plan.isCurrent}
                  >
                    {plan.isCurrent ? "Current Plan" : "Select Plan"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Your recent invoices and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscription.invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.amount}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={invoice.status === 'paid' ? 'outline' : 'destructive'}
                          className={invoice.status === 'paid' ? 'text-green-500 bg-green-50' : ''}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                View All Invoices
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Your billing details and tax information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium mb-1">Billing Contact</h4>
                  <p className="text-sm">John Doe</p>
                  <p className="text-sm">john.doe@example.com</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Billing Address</h4>
                  <p className="text-sm">123 Main St</p>
                  <p className="text-sm">San Francisco, CA 94103</p>
                  <p className="text-sm">United States</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Tax Information</h4>
                <p className="text-sm">Tax ID: 12-3456789</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                Update Billing Information
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
              <CardDescription>Track your storage usage across events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Total Storage
                  </span>
                  <span className="text-sm font-medium">
                    {subscription.storage.used} / {subscription.storage.total}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${subscription.storage.percent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  You've used {subscription.storage.percent}% of your storage
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-3">Storage by Event</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Wedding Event</span>
                      <span className="text-sm">5.2 GB</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '42%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Birthday Party</span>
                      <span className="text-sm">3.7 GB</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '30%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Corporate Conference</span>
                      <span className="text-sm">2.1 GB</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: '17%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Family Reunion</span>
                      <span className="text-sm">1.3 GB</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '11%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage</CardTitle>
              <CardDescription>Track your feature usage and limits</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Limit</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Events</TableCell>
                    <TableCell>12</TableCell>
                    <TableCell>Unlimited</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-500 bg-green-50">
                        Good
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Photos per event</TableCell>
                    <TableCell>~150</TableCell>
                    <TableCell>Unlimited</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-500 bg-green-50">
                        Good
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">API Calls</TableCell>
                    <TableCell>3,240</TableCell>
                    <TableCell>10,000 / month</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-500 bg-green-50">
                        32.4%
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Team Members</TableCell>
                    <TableCell>2</TableCell>
                    <TableCell>5</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-yellow-500 bg-yellow-50">
                        40%
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 