# Quick Start Guide (Beta)

## Local Development (Cursor IDE)

1. Clone the repository:
```bash
git clone https://github.com/your-username/cloud-burst.git
cd cloud-burst
```

2. Install dependencies:
```bash
npm ci # Using clean install for consistency
```

3. Set up local environment:
```bash
# Copy example env file
cp .env.example .env.local

# Run setup script
./scripts/setup-environment.sh local
```

4. Start development server:
```bash
npm run dev
```

## Replit Deployment [Beta Tested]

1. Create new Repl
   - Choose "Import from GitHub"
   - Select Node.js 20 template

2. Import repository:
   - Paste GitHub URL
   - Select main branch

3. Run setup script:
```bash
./scripts/setup-environment.sh replit
```

4. Add Essential Secrets in Replit [Required]:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_SITE_URL
   - SUPABASE_SERVICE_ROLE_KEY

5. Deploy:
   ```bash
   # Memory optimization (Required for Replit)
   export NODE_OPTIONS="--max-old-space-size=512"
   
   # Build and start
   npm run build
   npm run start
   ```

### Common Issues [Beta Solutions]

1. Memory Errors:
   ```bash
   rm -rf .next
   rm -rf node_modules/.cache
   npm run build
   ```

2. Build Failures:
   ```bash
   npm ci
   npm run build
   ```

### Features On Hold [Post-Beta]
⏸️ Advanced monitoring
⏸️ Complex caching
⏸️ Detailed metrics 