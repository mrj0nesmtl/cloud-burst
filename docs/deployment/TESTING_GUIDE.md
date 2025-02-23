# Deployment Testing Guide
📅 February 23, 2025 | v0.1.14

## 1. Local Build Testing

### Pre-deployment Checks
```bash
# Clean environment
rm -rf .next
rm -rf node_modules
npm cache clean --force

# Fresh install
npm ci
npm run build

# Verify build output
ls -la .next/
```

### Environment Testing
```bash
# Create test .env.local
cp .env.example .env.local

# Verify environment loading
npm run dev
```

## 2. Production Build Testing

### Build Verification
```bash
# Production build
NODE_ENV=production npm run build

# Memory usage check
NODE_OPTIONS="--max-old-space-size=512" npm run build
```

### Common Issues & Solutions
- Memory Exceeded
  ```bash
  # Solution: Clear cache and rebuild
  rm -rf .next
  NODE_OPTIONS="--max-old-space-size=512" npm run build
  ```
- Module Resolution
  ```bash
  # Solution: Clear modules and reinstall
  rm -rf node_modules
  npm ci
  ```

## 3. Deployment Verification

### Environment Variables
```typescript
// pages/api/health.ts
export default function handler(req, res) {
  const envCheck = {
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    site: !!process.env.NEXT_PUBLIC_SITE_URL,
    node_env: process.env.NODE_ENV
  };
  
  res.status(200).json({
    status: 'healthy',
    environment: envCheck
  });
}
```

### Security Checks
- Headers verification
- CORS configuration
- Environment variable protection
- Authentication flow

## 4. Performance Testing

### Metrics to Monitor
- Build time
- First Load JS
- Memory usage
- API response times

### Lighthouse Checks
```bash
# Install lighthouse
npm install -g lighthouse

# Run tests
lighthouse https://cloud-burst.replit.app
```

## 5. Error Recovery Testing

### Build Failures
```bash
# 1. Clean state
rm -rf .next node_modules
npm cache clean --force

# 2. Fresh install
npm ci

# 3. Rebuild
npm run build
```

### Runtime Errors
```typescript
// Add error boundary to app/layout.tsx
import { ErrorBoundary } from 'react-error-boundary';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      {children}
    </ErrorBoundary>
  );
}
```

## 6. Deployment Checklist

### Pre-deployment
- [ ] All environment variables set
- [ ] Build succeeds locally
- [ ] TypeScript checks pass
- [ ] ESLint passes
- [ ] Dependencies resolved

### Post-deployment
- [ ] Health check endpoint responds
- [ ] Static assets loaded
- [ ] Authentication works
- [ ] API routes functional
- [ ] Error boundaries tested

## 7. Monitoring Setup

### Health Checks
```typescript
// Monitor build health
const buildHealth = {
  status: process.env.NODE_ENV,
  buildId: process.env.NEXT_BUILD_ID,
  memory: process.memoryUsage()
};
```

### Performance Monitoring
- Setup Sentry
- Configure error tracking
- Monitor memory usage
- Track API performance 