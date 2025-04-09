-- Migration: Set up auth email templates
BEGIN;

-- Confirmation Email Template (for Event Organizer Signup)
INSERT INTO auth.email_templates (template_id, template)
VALUES ('confirm_signup', jsonb_build_object(
  'subject', 'Confirm Your Cloud Burst Event Signup',
  'content_html', '
    <table style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <tr>
        <td style="text-align: center; padding: 40px 0;">
          <img src="{{ .SiteURL }}/images/email/logo.png" alt="Cloud Burst Logo" style="max-width: 200px;">
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #0066FF; text-align: center; margin-bottom: 30px;">Welcome to Cloud Burst!</h1>
          <p style="color: #333333; font-size: 16px; line-height: 24px; margin-bottom: 30px; text-align: center;">
            Thank you for signing up as an Event Organizer. To complete your registration and activate your account, please confirm your email address.
          </p>
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="{{ .ConfirmationURL }}" style="background-color: #0066FF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Confirm My Account
            </a>
          </div>
          <p style="color: #666666; font-size: 14px; text-align: center;">
            If the button above doesn''t work, you can also use this verification code:<br>
            <strong style="color: #333333; font-size: 18px;">{{ .Token }}</strong>
          </p>
        </td>
      </tr>
    </table>
  '
)) ON CONFLICT (template_id) DO UPDATE SET template = EXCLUDED.template;

-- Staff Invitation Email Template
INSERT INTO auth.email_templates (template_id, template)
VALUES ('invite_staff', jsonb_build_object(
  'subject', 'You''ve Been Invited to Join the Event Staff on Cloud Burst',
  'content_html', '
    <table style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <tr>
        <td style="text-align: center; padding: 40px 0;">
          <img src="{{ .SiteURL }}/images/email/logo.png" alt="Cloud Burst Logo" style="max-width: 200px;">
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #0066FF; text-align: center; margin-bottom: 30px;">Event Staff Invitation</h1>
          <p style="color: #333333; font-size: 16px; line-height: 24px; margin-bottom: 20px;">
            You''ve been invited by {{ .InviterName }} to join the event staff for <strong>{{ .EventName }}</strong>.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{ .InvitationURL }}" style="background-color: #0066FF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #666666; font-size: 14px; text-align: center;">
            This invitation will expire in 7 days.
          </p>
        </td>
      </tr>
    </table>
  '
)) ON CONFLICT (template_id) DO UPDATE SET template = EXCLUDED.template;

-- Magic Link Email Template
INSERT INTO auth.email_templates (template_id, template)
VALUES ('magic_link', jsonb_build_object(
  'subject', 'Your Cloud Burst Login Link',
  'content_html', '
    <table style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <tr>
        <td style="text-align: center; padding: 40px 0;">
          <img src="{{ .SiteURL }}/images/email/logo.png" alt="Cloud Burst Logo" style="max-width: 200px;">
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #0066FF; text-align: center; margin-bottom: 30px;">Login to Cloud Burst</h1>
          <p style="color: #333333; font-size: 16px; line-height: 24px; margin-bottom: 30px; text-align: center;">
            Click the button below to securely log in to your Cloud Burst account.
          </p>
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="{{ .ConfirmationURL }}" style="background-color: #0066FF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Log In to Cloud Burst
            </a>
          </div>
          <p style="color: #666666; font-size: 14px; text-align: center;">
            This link will expire in 24 hours. If you didn''t request this link, you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>
  '
)) ON CONFLICT (template_id) DO UPDATE SET template = EXCLUDED.template;

-- Reset Password Email Template
INSERT INTO auth.email_templates (template_id, template)
VALUES ('reset_password', jsonb_build_object(
  'subject', 'Reset Your Cloud Burst Password',
  'content_html', '
    <table style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <tr>
        <td style="text-align: center; padding: 40px 0;">
          <img src="{{ .SiteURL }}/images/email/logo.png" alt="Cloud Burst Logo" style="max-width: 200px;">
        </td>
      </tr>
      <tr>
        <td style="padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #0066FF; text-align: center; margin-bottom: 30px;">Reset Your Password</h1>
          <p style="color: #333333; font-size: 16px; line-height: 24px; margin-bottom: 30px; text-align: center;">
            We received a request to reset your password. Click the button below to choose a new password.
          </p>
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="{{ .ConfirmationURL }}" style="background-color: #0066FF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666666; font-size: 14px; text-align: center;">
            If you didn''t request a password reset, you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>
  '
)) ON CONFLICT (template_id) DO UPDATE SET template = EXCLUDED.template;

COMMIT; 