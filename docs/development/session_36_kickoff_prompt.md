# Session 36 Kickoff Prompt: Public Invitation Landing Page & RSVP Form

## 🚀 Session Objectives

For Session 36, our focus is on implementing the public invitation landing page and RSVP form functionality. Building on our successful QR scanner implementation, we now need to create the complete invitation response flow.

Key deliverables:
1. Public invitation landing page with token validation
2. RSVP form with validation for accepting/declining invitations
3. Confirmation screens for accepted/declined responses
4. Backend API endpoints for processing RSVPs
5. Email notification system for RSVP status updates

## 📋 Development Requirements

### Invitation Landing Page
- Create dynamic routes using Next.js App Router for `/invitation/[token]`
- Implement server-side validation of invitation tokens
- Design responsive layout for viewing invitation details
- Handle expired/invalid invitation tokens with appropriate redirects

### RSVP Form Component
- Build form using react-hook-form with zod validation
- Support for plus-one guests if allowed in invitation
- Fields for dietary restrictions and additional notes
- Validation for all form inputs with helpful error messages
- Loading states and submission handling

### Confirmation Flow
- Create confirmation pages for accepted and declined responses
- Implement appropriate visual feedback and animations
- Add share/add-to-calendar functionality for accepted invitations
- Provide option to update response if needed

### Backend Implementation
- Create API routes for invitation validation and RSVP submission
- Implement database interactions using Supabase client
- Set up email notifications for RSVP status changes
- Ensure proper error handling and validation

## 🧠 Technical Considerations

- Use TypeScript strictly typed interfaces for all components
- Implement proper loading and error states
- Ensure mobile-first responsive design
- Follow accessibility best practices
- Optimize for performance with appropriate caching strategies
- Use server and client components strategically

## 📚 Reference Resources

Refer to the following resources for implementation guidance:
- `docs/development/session_36_resources.md` for code snippets and examples
- `docs/development/session_36_checklist.md` for task tracking
- Previous implementation of the QR scanner component
- Supabase documentation for database operations
- Shadcn/ui component library for form elements

## 🔍 Starting Points

1. Begin with implementing the invitation token validation endpoint
2. Create the basic invitation page layout with server-side rendering
3. Implement the RSVP form component with client-side validation
4. Build the submission and confirmation flow
5. Add polish with animations and responsive design

Let's create a seamless and delightful RSVP experience for event attendees! 