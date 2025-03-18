import sgMail from '@sendgrid/mail';
import { Invitation } from '@/types/invitations';

// Initialize SendGrid with API key
if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not set in environment variables');
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Types for email data
export interface EmailData {
  to: string;
  templateId: string;
  dynamicTemplateData: Record<string, unknown>;
}

export interface InvitationEmailData {
  eventName: string;
  eventDate: string;
  eventLocation: string;
  invitationLink: string;
  recipientName: string;
  hostName: string;
  hostEmail: string;
  galleryLink: string;
}

/**
 * Sends an email using SendGrid's API
 * @param emailData The email data to send
 * @returns Promise<boolean> true if email was sent successfully
 * @throws Error if email sending fails
 */
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  if (!process.env.SENDGRID_FROM_EMAIL) {
    throw new Error('SENDGRID_FROM_EMAIL is not set in environment variables');
  }

  try {
    const msg = {
      to: emailData.to,
      from: process.env.SENDGRID_FROM_EMAIL,
      templateId: emailData.templateId,
      dynamicTemplateData: emailData.dynamicTemplateData,
    };

    await sgMail.send(msg);
    console.log(`Email sent successfully to ${emailData.to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Sends an invitation email using a predefined template
 * @param invitation The invitation object
 * @param emailData Additional data needed for the email template
 * @returns Promise<boolean> true if email was sent successfully
 */
export async function sendInvitationEmail(
  invitation: Invitation,
  emailData: InvitationEmailData
): Promise<boolean> {
  if (!process.env.SENDGRID_TEMPLATE_ID) {
    throw new Error('SENDGRID_TEMPLATE_ID is not set in environment variables');
  }

  const data: EmailData = {
    to: invitation.email,
    templateId: process.env.SENDGRID_TEMPLATE_ID,
    dynamicTemplateData: {
      eventName: emailData.eventName,
      eventDate: emailData.eventDate,
      eventLocation: emailData.eventLocation,
      invitationLink: emailData.invitationLink,
      recipientName: emailData.recipientName || invitation.name,
      token: invitation.token,
      hostName: emailData.hostName,
      hostEmail: emailData.hostEmail,
      galleryLink: emailData.galleryLink,
    },
  };

  return sendEmail(data);
} 