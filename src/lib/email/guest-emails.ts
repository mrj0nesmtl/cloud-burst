import { sendEmail as sendEmailService } from './email-service';

interface GuestEmailData {
  to: string;
  name?: string;
  eventName?: string;
  magicLink?: string;
  hostName?: string;
}

/**
 * Sends a magic link email to a guest
 * @param data Email data including recipient, name, and magic link
 * @returns Success status of the email sending operation
 */
export async function sendMagicLinkEmail(data: GuestEmailData): Promise<boolean> {
  const { to, name = 'Guest', eventName = 'Event', magicLink, hostName = 'Event Host' } = data;
  
  if (!magicLink) {
    console.error('Magic link URL is required');
    return false;
  }
  
  const subject = `Access your ${eventName} dashboard`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #333; margin: 0;">Your Event Dashboard Access</h1>
      </div>
      
      <div style="padding: 20px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Hello ${name},</p>
        
        <p>Here's your secure access link to the <strong>${eventName}</strong> dashboard:</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${magicLink}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Access Dashboard
          </a>
        </div>
        
        <p>This link will expire in 24 hours. If you didn't request this link, you can safely ignore this email.</p>
        
        <p>Thank you,<br>${hostName}</p>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </div>
  `;
  
  const textContent = `
Hello ${name},

Here's your secure access link to the ${eventName} dashboard:

${magicLink}

This link will expire in 24 hours. If you didn't request this link, you can safely ignore this email.

Thank you,
${hostName}
  `;
  
  try {
    const result = await sendEmailService({
      to,
      subject,
      html: htmlContent,
      text: textContent,
      templateData: {
        name,
        eventName,
        magicLink,
        hostName
      }
    });
    
    return result.success;
  } catch (error) {
    console.error('Failed to send magic link email:', error);
    return false;
  }
}

/**
 * Sends a welcome email to a new guest
 * @param data Email data for the welcome email
 * @returns Success status of the email sending operation
 */
export async function sendGuestWelcomeEmail(data: GuestEmailData): Promise<boolean> {
  const { to, name = 'Guest', eventName = 'Event', hostName = 'Event Host' } = data;
  
  const subject = `Welcome to ${eventName}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #333; margin: 0;">Welcome to ${eventName}</h1>
      </div>
      
      <div style="padding: 20px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Hello ${name},</p>
        
        <p>Thank you for registering for <strong>${eventName}</strong>. We're excited to have you join us!</p>
        
        <p>Your guest profile has been created. You can access the event dashboard using the link shared with you.</p>
        
        <p>Thank you,<br>${hostName}</p>
      </div>
    </div>
  `;
  
  const textContent = `
Hello ${name},

Thank you for registering for ${eventName}. We're excited to have you join us!

Your guest profile has been created. You can access the event dashboard using the link shared with you.

Thank you,
${hostName}
  `;
  
  try {
    const result = await sendEmailService({
      to,
      subject,
      html: htmlContent,
      text: textContent,
      templateData: {
        name,
        eventName,
        hostName
      }
    });
    
    return result.success;
  } catch (error) {
    console.error('Failed to send guest welcome email:', error);
    return false;
  }
} 