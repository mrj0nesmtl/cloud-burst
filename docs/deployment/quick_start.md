# Quick Start Guide

## Local Development (Cursor IDE)

1. Clone the repository:
```bash
git clone https://github.com/your-username/cloud-burst.git
cd cloud-burst
```

2. Install dependencies:
```bash
npm install
```

3. Set up local environment:
```bash
./scripts/setup-environment.sh local
```

4. Start development server:
```bash
npm run dev
```

## Replit Deployment

1. Create new Repl
2. Import from GitHub repository
3. Run setup script:
```bash
./scripts/setup-environment.sh replit
```

4. Add Secrets in Replit:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_SITE_URL (https://cloudburst-beta.replit.app)
   - SUPABASE_SERVICE_ROLE_KEY

5. Deploy:
   - Replit will automatically detect the configuration
   - Build and start commands are pre-configured 