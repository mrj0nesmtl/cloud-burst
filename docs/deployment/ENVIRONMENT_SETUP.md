# Environment Setup Guide for Replit Deployment

## Required Environment Variables

### 1. Supabase Configuration
```bash
# Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 2. Site Configuration
```bash
# Your Replit deployment URL
NEXT_PUBLIC_SITE_URL=https://cloudburst-beta.replit.app
```

### 3. System Configuration
```bash
# Production settings
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## Setting up in Replit

1. Navigate to "Secrets" in your Replit project
2. Add each environment variable:
   ```bash
   # Using Replit CLI
   replit secrets add NEXT_PUBLIC_SUPABASE_URL "your-value"
   replit secrets add NEXT_PUBLIC_SUPABASE_ANON_KEY "your-value"
   replit secrets add SUPABASE_SERVICE_ROLE_KEY "your-value"
   replit secrets add NEXT_PUBLIC_SITE_URL "https://cloudburst-beta.replit.app"
   ```

## Verification Steps

1. Check environment loading:
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SITE_URL
   ```

2. Verify in Next.js:
   ```typescript
   console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
   ```

## Security Notes

- Never commit environment variables to Git
- Use Replit Secrets for all sensitive values
- Rotate keys periodically
- Monitor access logs 