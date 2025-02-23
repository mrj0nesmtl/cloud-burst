# Session 10: Authentication Reset Checklist
📅 February 21, 2025

## 1. Pre-Reset Tasks
- [ ] Stop local development server
- [ ] Clear Next.js cache (`rm -rf .next`)
- [ ] Create new Supabase project
- [ ] Save new environment variables
- [ ] Backup any critical data (if needed)

## 2. Files to Remove
### Auth Pages
- [ ] src/app/auth/signin/page.tsx
- [ ] src/app/auth/signup/page.tsx
- [ ] src/app/auth/reset-password/page.tsx
- [ ] src/app/auth/layout.tsx

### Auth Components
- [ ] src/components/auth/email-auth-form.tsx
- [ ] src/components/auth/login-form.tsx
- [ ] src/components/auth/role-guard.tsx
- [ ] src/contexts/auth-context.tsx

### Configuration
- [ ] src/lib/supabase/config.ts
- [ ] src/lib/supabase/server-config.ts
- [ ] src/lib/auth/auth-store.ts

### Types
- [ ] src/types/auth.ts

## 3. New Implementation Setup
### Supabase
- [ ] Create new project
- [ ] Set up database schema
- [ ] Configure RLS policies
- [ ] Set up auth settings
- [ ] Test connection

### New File Structure
- [ ] src/lib/supabase/client.ts
- [ ] src/lib/supabase/server.ts
- [ ] src/lib/supabase/types.ts
- [ ] src/components/auth/auth-form.tsx
- [ ] src/components/auth/auth-provider.tsx
- [ ] src/app/auth/layout.tsx
- [ ] src/middleware.ts

## 4. Environment Updates
- [ ] Update .env.local
- [ ] Update .env.example
- [ ] Update environment types

## 5. Dependencies
- [ ] Remove unused auth packages
- [ ] Install new required packages
- [ ] Update package.json
- [ ] Fresh npm install

## 6. Documentation Updates
- [ ] Update README.md
- [ ] Update auth documentation
- [ ] Update API documentation
- [ ] Update environment setup guide

## 7. Testing
- [ ] Test new auth flow
- [ ] Test protected routes
- [ ] Test RLS policies
- [ ] Test error handling

## 8. Final Verification
- [ ] All old auth files removed
- [ ] New implementation working
- [ ] No reference to old implementation
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Environment variables set
- [ ] Git status clean

## Notes
- Keep terminal output logs
- Document any issues encountered
- Track any unexpected dependencies
- Note any required follow-up tasks 