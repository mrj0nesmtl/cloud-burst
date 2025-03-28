# 📚 Session 32 Resources

## Technical References

### RSVP System Implementation
- [Supabase Auth Magic Links Documentation](https://supabase.com/docs/guides/auth/auth-magic-link)
- [Zod Validation Schema Patterns](https://zod.dev/?id=primitives)
- [React Hook Form Documentation](https://react-hook-form.com/get-started)
- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
- [Shadcn UI Form Components](https://ui.shadcn.com/docs/components/form)
- [SendGrid Email API Documentation](https://docs.sendgrid.com/api-reference/mail-send/mail-send)

### Database Schema Design
- [Supabase Database Schema Evolution](https://supabase.com/docs/guides/database/extensions/pg_graphql)
- [PostgreSQL Constraints Documentation](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [Row Level Security Policies](https://supabase.com/docs/guides/auth/row-level-security)

### Mobile Responsive Design
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Mobile-First Design Principles](https://css-tricks.com/how-to-develop-and-test-a-mobile-first-design-in-2021/)
- [Touch-friendly UI Development](https://web.dev/articles/mobile-touchandmouse)

### QR Code Implementation
- [QR Code Generation with JavaScript](https://github.com/davidshimjs/qrcodejs)
- [Camera API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [QR Code Scanning Libraries](https://github.com/nimiq/qr-scanner)

## Design Resources
- [RSVP Form Design Patterns](https://www.smashingmagazine.com/2018/10/form-design-patterns-book-excerpt/)
- [Mobile Form UX Best Practices](https://www.nngroup.com/articles/mobile-form-design/)
- [Email Template Design Guidelines](https://www.litmus.com/blog/the-anatomy-of-a-perfect-email-design/)

## Code Snippets & Templates

### Magic Link Authentication
```typescript
// Server API route for sending magic links
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const { email } = req.body
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )
  
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/rsvp/confirm`
    }
  })
  
  if (error) {
    return res.status(400).json({ error: error.message })
  }
  
  return res.status(200).json({ message: 'Magic link sent successfully' })
}
```

### RSVP Form with Zod Validation
```typescript
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const rsvpSchema = z.object({
  attendance: z.enum(['attending', 'not_attending', 'maybe']),
  plusOne: z.boolean(),
  dietaryRestrictions: z.string().optional(),
  message: z.string().max(500, 'Message must be 500 characters or less').optional()
})

type RsvpFormValues = z.infer<typeof rsvpSchema>

export function RsvpForm() {
  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      attendance: 'attending',
      plusOne: false,
      dietaryRestrictions: '',
      message: ''
    }
  })
  
  // Form implementation...
}
```

### Database Schema for RSVP Tracking
```sql
-- Add RSVP tracking fields to invitations table
ALTER TABLE invitations 
ADD COLUMN rsvp_status VARCHAR(20) CHECK (rsvp_status IN ('attending', 'not_attending', 'maybe', 'no_response')),
ADD COLUMN rsvp_responded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN dietary_restrictions TEXT,
ADD COLUMN plus_one_name TEXT,
ADD COLUMN plus_one_email TEXT,
ADD COLUMN guest_message TEXT,
ADD COLUMN email_opened_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX idx_invitations_rsvp_status ON invitations(rsvp_status);
```

## Project-Specific Resources
- Current Database Schema: See `src/types/supabase.ts`
- Invitation System: See `src/lib/supabase/invitations.ts`
- Form Components: See `src/components/ui/form.tsx`
- Email Templates: See `src/lib/email/templates/` 