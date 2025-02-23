# 🚀 Replit Deployment Guide for Cloud Burst
Version: 0.1.13 (Updated: Feb 23, 2025)

## 📋 Prerequisites
- Replit account with Node.js 20.x support
- GitHub repository access
- Supabase project credentials
- Minimum 512MB memory allocation

## 🔑 Environment Variables
```env
# Required Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://cloudburst.replit.app
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional Configuration
NEXT_PUBLIC_DEFAULT_THEME=system
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# System Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## 🛠️ Deployment Steps

### 1. Initial Setup
```bash
# Clone and setup
git clone https://github.com/your-username/cloud-burst.git
cd cloud-burst

# Install dependencies
npm install

# Build application
npm run build

# Start production server
npm run start
```

### 2. Replit Configuration
```nix
# replit.nix
{
  deps = [
    pkgs.nodejs-20_x
    pkgs.python3
    pkgs.gcc
    pkgs.git
  ];
}
```

### 3. Security Headers
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; connect-src 'self' https://*.supabase.co"
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  // ... other headers from deployment.mdc
]
```

## 🔍 Verification Checklist
- [ ] Node.js 20.x is active
- [ ] All environment variables are set
- [ ] Build completes successfully
- [ ] Security headers are active
- [ ] Supabase connection is verified
- [ ] Health endpoint responds
- [ ] Memory usage is within limits

## 🚨 Troubleshooting

### Memory Issues
```bash
# Check memory usage
free -h

# Clear build cache
rm -rf .next
npm run build
```

### Build Failures
```bash
# Clean install
rm -rf node_modules
npm install --production

# Verify Node version
node --version  # Should be >=20.x
```

## 📊 Monitoring
- Health Check: `/api/health`
- Memory Usage: Monitor via Replit dashboard
- Error Logs: Check application logs
- Performance: Use Lighthouse reports

## 🔒 Security Checklist
- [ ] All secrets in Replit Secrets
- [ ] HTTPS enforced
- [ ] CSP headers active
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] No sensitive data in logs

## 📝 Maintenance
- Weekly dependency updates
- Monthly security audits
- Regular backup verification
- Performance monitoring
- Log rotation

## 🔄 Rollback Procedure
```bash
# Tag current version
git tag v0.1.13

# Revert to previous stable
git checkout v0.1.12

# Rebuild
npm install
npm run build
```

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://cloudburst.replit.app

# Security and Features
NEXTAUTH_SECRET=generate_a_secure_random_string
NEXTAUTH_URL=https://cloudburst.replit.app

# AI Service Keys (if implementing immediately)
OPENAI_API_KEY=your_openai_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key

# Optional Analytics (if implementing)
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id