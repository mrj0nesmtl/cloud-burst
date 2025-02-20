# 🚀 Replit Deployment Guide for Cloud Burst

## 📋 Prerequisites
- Replit account
- GitHub repository access
- Supabase project credentials

## 🔑 Environment Variables Setup
```env
# Core Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://cloudburst-ai.replit.app
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# User Settings & Preferences
NEXT_PUBLIC_DEFAULT_THEME=system
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# Security Configuration
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=your_secure_secret
NEXTAUTH_URL=https://cloudburst-ai.replit.app
```

## ��️ Deployment Steps

### 1. Initial Setup
1. Create new Repl
   - Choose "Import from GitHub"
   - Select cloud-burst repository
   - Choose "Node.js" as language

### 2. Database Setup
1. Run migrations for user settings
2. Configure RLS policies for preferences
3. Set up notifications tables
4. Verify database connections

### 3. Build Process
```bash
npm install
npm run build
npm run start
```

### 4. Verify Deployment
- Check build logs for errors
- Verify environment variables
- Test application functionality
- Test user settings flow
- Test preferences saving
- Test notification system
- Confirm database connectivity

## 🔄 Continuous Deployment

### GitHub Integration
1. Enable GitHub sync
2. Configure auto-deploy settings
3. Set up branch protection rules

### Health Checks
- Monitor build status
- Check application logs
- Verify database connections
- Test authentication flow

## 🚨 Troubleshooting

### Common Issues
1. Build Failures
   - Check Node.js version
   - Verify dependencies
   - Review build logs

2. Runtime Errors
   - Check environment variables
   - Verify Supabase connection
   - Review application logs

3. Database Connection
   - Confirm Supabase credentials
   - Check RLS policies
   - Verify network access

## 📝 Maintenance

### Regular Tasks
- Monitor resource usage
- Update dependencies
- Review security alerts
- Backup configuration

### Performance Optimization
- Enable caching
- Optimize build size
- Configure CDN
- Monitor response times

## 🔒 Security Considerations

### Best Practices
- Keep secrets in Replit Secrets
- Enable HTTPS only
- Configure CORS properly
- Regular security audits

### Access Control
- Manage deployment tokens
- Review collaborator access
- Monitor auth logs
- Regular permission audits 

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