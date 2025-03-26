import sgMail from '@sendgrid/mail';
import { Invitation } from '@/types/invitations';

// Initialize SendGrid with API key if available
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('SendGrid initialized successfully');
} else {
  console.warn('SENDGRID_API_KEY is not set in environment variables. Email functionality will be disabled.');
}

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
  message?: string;
}

/**
 * Sends an email using SendGrid's API
 * @param emailData The email data to send
 * @returns Promise<boolean> true if email was sent successfully
 * @throws Error if email sending fails
 */
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    console.warn('Cannot send email: SENDGRID_API_KEY is not set');
    return false;
  }
  
  if (!process.env.SENDGRID_FROM_EMAIL) {
    console.warn('Cannot send email: SENDGRID_FROM_EMAIL is not set');
    return false;
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
  if (!SENDGRID_API_KEY) {
    console.warn('Cannot send invitation email: SENDGRID_API_KEY is not set');
    return false;
  }
  
  const templateId = process.env.SENDGRID_TEMPLATE_ID;
  if (!templateId) {
    console.warn('Cannot send invitation email: SENDGRID_TEMPLATE_ID is not set');
    return false;
  }

  const data: EmailData = {
    to: invitation.email,
    templateId: templateId,
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
      message: emailData.message || '',
    },
  };

  return sendEmail(data);
} 