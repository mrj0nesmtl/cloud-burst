# Environment Setup Guide for Replit Deployment (Beta)

## Required Environment Variables [Tested Working]

### 1. Supabase Configuration
```bash
# Essential Supabase variables (Required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 2. Site Configuration
```bash
# Replit deployment URL (Verified)
NEXT_PUBLIC_SITE_URL=https://cloudburst-beta.replit.app
```

### 3. System Configuration
```bash
# Production settings (Required)
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## Setting up in Replit [Verified Process]

1. Navigate to "Secrets" in your Replit project
2. Add each environment variable:
   ```bash
   # Using Replit CLI (Tested Working)
   replit secrets add NEXT_PUBLIC_SUPABASE_URL "your-value"
   replit secrets add NEXT_PUBLIC_SUPABASE_ANON_KEY "your-value"
   replit secrets add SUPABASE_SERVICE_ROLE_KEY "your-value"
   replit secrets add NEXT_PUBLIC_SITE_URL "https://cloudburst-beta.replit.app"
   ```

## Verification Steps [Beta Checklist]

1. Check environment loading:
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SITE_URL
   ```

2. Verify in Next.js:
   ```typescript
   console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
   ```

## Security Notes [Beta Priority]

- ✅ Never commit environment variables to Git
- ✅ Use Replit Secrets for all sensitive values
- 🟡 Basic key rotation
- 🟡 Simple access monitoring

### Features On Hold [Post-Beta]
⏸️ Advanced monitoring
⏸️ Complex security headers
⏸️ Advanced caching configuration
⏸️ Detailed logging setup 