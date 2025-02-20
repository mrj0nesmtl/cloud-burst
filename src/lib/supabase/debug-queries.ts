export const diagnosticQueries = {
  checkUserProfile: `
    SELECT EXISTS (
      SELECT 1 FROM public.user_profiles 
      LIMIT 1
    );
  `,
  checkRoles: `
    SELECT EXISTS (
      SELECT 1 FROM public.roles 
      LIMIT 1
    );
  `,
  checkAuth: `
    SELECT EXISTS (
      SELECT 1 FROM auth.users 
      LIMIT 1
    );
  `
} 