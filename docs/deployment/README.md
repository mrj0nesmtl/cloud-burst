# Cloud Burst Deployment Guide
Version: 0.1.14 | Updated: February 23, 2025

## 📚 Documentation Structure

```bash
docs/deployment/
├── README.md               # This file
├── QUICK_START.md         # Quick start guide
├── ENVIRONMENT_SETUP.md   # Environment configuration
├── BUILD_CONFIGURATION.md # Build process setup
└── TESTING_GUIDE.md      # Testing procedures
```

## 🚀 Deployment Options

### Local Development (Cursor IDE)
For local development and testing:
```bash
./scripts/setup-environment.sh local
```

### Production (Replit)
For production deployment:
```bash
./scripts/setup-environment.sh replit
```

## 🔄 Environment Switching

### Local to Production
1. Commit all changes
2. Push to GitHub
3. Create new Repl from GitHub
4. Run setup script
5. Configure secrets

### Production to Local
1. Pull latest changes
2. Run local setup
3. Configure local environment

## 🔍 Verification Steps

### Local
1. Environment variables loaded
2. Development server running
3. Supabase connection working
4. Hot reload functioning

### Production
1. Build successful
2. Environment secrets set
3. Production server running
4. Supabase connection working

## 🛟 Support

- Check [TESTING_GUIDE.md](./TESTING_GUIDE.md) for troubleshooting
- Review [BUILD_CONFIGURATION.md](./BUILD_CONFIGURATION.md) for build issues
- See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for environment problems

## 📋 Deployment Checklist

- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Build successful
- [ ] Tests passing
- [ ] Security headers active
- [ ] Performance metrics acceptable 