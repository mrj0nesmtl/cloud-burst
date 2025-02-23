# 🚀 Replit Deployment Guide for Cloud Burst
Version: 0.1.14 (Updated: Feb 23, 2025)

## 📚 Related Documentation
- [Environment Setup Guide](./ENVIRONMENT_SETUP.md)
- [Build Configuration Guide](./BUILD_CONFIGURATION.md)
- [Testing Guide](./TESTING_GUIDE.md)

## 📋 Prerequisites
- Replit account with Node.js 20.x support
- GitHub repository access
- Supabase project credentials
- Minimum 512MB memory allocation

## 🔑 Environment Setup
See [Environment Setup Guide](./ENVIRONMENT_SETUP.md) for detailed configuration.

```env
# Required Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://cloud-burst.replit.app
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# System Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## 🛠️ Deployment Process

### 1. Repository Setup
```bash
# Clone repository
git clone https://github.com/mrj0nesmtl/cloud-burst.git
cd cloud-burst

# Switch to deployment branch
git checkout -b deployment/v0.1.14
```

### 2. Configuration Files
See [Build Configuration Guide](./BUILD_CONFIGURATION.md) for detailed settings.

```nix
# replit.nix
{ pkgs }: {
    deps = [
        pkgs.nodejs-20_x
        pkgs.python3
        pkgs.gcc
        pkgs.git
    ];
}
```

### 3. Build Process
```bash
# Install dependencies
npm ci --production

# Build application
NODE_OPTIONS="--max-old-space-size=512" npm run build

# Start production server
npm run start
```

## 🔍 Verification Steps
See [Testing Guide](./TESTING_GUIDE.md) for comprehensive testing procedures.

### Quick Checks
- [ ] Node.js version verification
- [ ] Environment variables loaded
- [ ] Build completion
- [ ] Security headers active
- [ ] Health endpoint response
- [ ] Memory utilization

## 🚨 Common Issues & Solutions

### Memory Management
```bash
# Memory optimization
NODE_OPTIONS="--max-old-space-size=512"
rm -rf .next
npm run build
```

### Build Failures
```bash
# Clean installation
rm -rf node_modules
npm ci
npm run build
```

## 📊 Monitoring & Maintenance

### Health Checks
- `/api/health` endpoint monitoring
- Memory usage tracking
- Error logging
- Performance metrics

### Security Measures
- Weekly security audits
- Secret rotation
- Access log review
- Dependency updates

## 🔄 Version Control
```bash
# Version tagging
git tag v0.1.14
git push origin v0.1.14

# Rollback if needed
git checkout v0.1.13
```

## 📝 Documentation Updates
- Update CHANGELOG.md
- Review environment variables
- Update version numbers
- Document any issues

## 🔒 Security Checklist
- [ ] Secrets in Replit Secrets
- [ ] HTTPS enforced
- [ ] CSP headers active
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Audit logging active

## 🤝 Support & Resources
- [Replit Documentation](https://docs.replit.com)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.io/docs)
- Internal Support: #deployment-support

## 📈 Performance Monitoring
- Lighthouse scores
- API response times
- Build performance
- Memory usage trends

Remember to check the specific guides for detailed information on each aspect of the deployment process.

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://cloudburst-beta.replit.app

# Security and Features
NEXTAUTH_SECRET=generate_a_secure_random_string
NEXTAUTH_URL=https://cloudburst.replit.app

# AI Service Keys (if implementing immediately)
OPENAI_API_KEY=your_openai_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key

# Optional Analytics (if implementing)
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id