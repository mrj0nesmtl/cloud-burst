# 🚀 Cloud Burst Deployment Guide

> **Version:** 0.7.0  
> **Last Updated:** March 2024  
> **Platform:** Replit  
> **Node.js Version:** 20.x

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deployment Configuration](#deployment-configuration)
4. [Build Process](#build-process)
5. [Common Issues & Solutions](#common-issues--solutions)
6. [Verification Checklist](#verification-checklist)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- Replit account with Node.js 20.x template
- GitHub repository access
- Supabase project with the following credentials:
  - Supabase URL
  - Supabase Anon Key
  - Supabase Service Role Key
- 512MB memory allocation (critical for build process)

## Environment Setup

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://bxvbovzqzjfomqtdzzx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` |
| `NEXT_PUBLIC_SITE_URL` | Your Replit deployment URL | `https://cb-beta.replit.app` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` |
| `NODE_ENV` | Environment setting | `production` |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | `1` |

### Setting Up Secrets in Replit

1. Navigate to the "Secrets" tab in your Replit project
2. Add each required environment variable:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

> **Note:** Make sure to use the exact same variable names as listed above.

## Deployment Configuration

### .replit Configuration

Create or update your `.replit` file with the following content:

```
modules = ["nodejs-20", "web", "bash"]
run = "npm run dev"

[nix]
channel = "stable-24_05"

[env]
NODE_ENV = "production"
NEXT_TELEMETRY_DISABLED = "1"

[deployment]
run = ["sh", "-c", "npm run start"]
deploymentTarget = "cloudrun"
ignorePorts = false
build = ["sh", "-c", "npm run build"]

[[ports]]
localPort = 3000
externalPort = 80
```

### package.json Scripts

Ensure your `package.json` has the following scripts:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

## Build Process

### Step 1: Repository Setup

If starting from scratch:

```bash
# Clone repository
git clone https://github.com/your-username/cloud-burst.git
cd cloud-burst
```

### Step 2: Install Dependencies

```bash
# Clean install for consistency
npm ci
```

### Step 3: Build the Application

```bash
# Build with memory optimization
npm run build
```

### Step 4: Start the Server

```bash
# Start the production server
npm run start
```

## Common Issues & Solutions

### 1. Memory Errors

**Symptoms:**
- Build process fails with "JavaScript heap out of memory" error
- Build process hangs or crashes

**Solutions:**
```bash
# Clean up previous build artifacts
rm -rf .next
rm -rf node_modules/.cache

# Rebuild with memory optimization
npm run build
```

### 2. Dynamic Server Usage Errors

**Symptoms:**
- Error: "Dynamic server usage: cookies"
- Error: "Dynamic server usage: request.url"

**Solutions:**
- Add `export const dynamic = 'force-dynamic';` to the top of affected pages
- Affected files typically include:
  - `src/app/protected/dashboard/page.tsx`
  - `src/app/protected/admin/layout.tsx`
  - `src/app/protected/layout.tsx`

### 3. Prerendering Failures for Protected Routes

**Symptoms:**
- Error: "Prerendering failed for route /protected/..."

**Solutions:**
- Add `export const dynamic = 'force-dynamic';` to protected route segments
- Update middleware to handle build-time execution
- Implement proper fallbacks for protected routes

### 4. Server Component Type Errors

**Symptoms:**
- Error: "Unsupported Server Component type"

**Solutions:**
- Fix import patterns in server components
- Ensure server components don't import client components
- Move shared types to separate files
- Use proper dynamic imports for client components

## Verification Checklist

After deployment, verify the following:

- [ ] Application loads without errors
- [ ] Authentication flow works correctly
- [ ] Protected routes are accessible after login
- [ ] Admin routes are restricted to admin users
- [ ] Images and assets load properly
- [ ] Forms and interactive elements function correctly
- [ ] No console errors in browser developer tools

## Troubleshooting

### Deployment Logs

Always check the deployment logs for specific error messages:

1. Go to the "Deployments" tab in your Replit project
2. Click on the latest deployment
3. Check the "Logs" tab for error messages

### Common Error Messages and Solutions

| Error Message | Solution |
|---------------|----------|
| "JavaScript heap out of memory" | Clean build artifacts and rebuild |
| "Dynamic server usage" | Add `export const dynamic = 'force-dynamic';` to affected pages |
| "Prerendering failed" | Configure route segments with proper dynamic settings |
| "Unsupported Server Component type" | Fix import patterns and component boundaries |
| "Module not found" | Check dependencies and import paths |

### Redeployment Process

If you need to redeploy after making changes:

1. Commit and push your changes to GitHub
2. In Replit, click the "Redeploy" button
3. Monitor the deployment logs for any errors
4. Verify the application functionality after deployment

---

## Advanced Configuration (Post-Beta)

The following features are on hold for post-beta development:

- Advanced monitoring systems
- Complex caching layers
- Detailed metrics collection
- Advanced security headers
- Complex optimization configurations

---

*For questions or support, please contact the Cloud Burst development team.* 