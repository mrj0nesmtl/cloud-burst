# Replit Deployment Quick Reference

> **Version:** 0.7.0  
> **Last Updated:** March 2024

## 🔑 Essential Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Replit deployment URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `NODE_ENV` | ✅ | Set to `production` |
| `NEXT_TELEMETRY_DISABLED` | ✅ | Set to `1` |

## 📄 Required Configuration Files

### .replit

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

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

## 🚀 Deployment Steps

1. **Set up environment variables in Replit Secrets**
2. **Ensure .replit file is configured correctly**
3. **Deploy using the Replit deployment interface**
4. **Monitor logs for any errors**
5. **Verify application functionality**

## 🔄 Redeployment Process

1. **Make code changes**
2. **Commit and push to GitHub**
3. **Click "Redeploy" in Replit**
4. **Monitor deployment logs**
5. **Verify changes in production**

## 🛠️ Common Fixes

### Memory Issues

```bash
# Clean build artifacts
rm -rf .next
rm -rf node_modules/.cache

# Rebuild
npm run build
```

### Dynamic Server Usage Errors

Add to affected files:

```typescript
export const dynamic = 'force-dynamic';
```

### Protected Routes Issues

Add to layout files:

```typescript
export const dynamic = 'force-dynamic';
```

## 📋 Deployment Checklist

- [ ] Environment variables set in Replit Secrets
- [ ] .replit file configured correctly
- [ ] package.json scripts set up properly
- [ ] Dynamic rendering configured for protected routes
- [ ] Server component issues addressed
- [ ] Application builds successfully
- [ ] Application starts without errors
- [ ] All routes accessible and functioning

---

*For detailed instructions, see the comprehensive [Cloud Burst Deployment Guide](./CLOUD_BURST_DEPLOYMENT_GUIDE.md).* 