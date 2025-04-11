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

  console.log(`Preparing to send email to ${emailData.to} with template ${emailData.templateId}`);
  
  try {
    const msg = {
      to: emailData.to,
      from: process.env.SENDGRID_FROM_EMAIL,
      templateId: emailData.templateId,
      dynamicTemplateData: emailData.dynamicTemplateData,
    };

    console.log(`Sending email with SendGrid: 
      To: ${msg.to}
      From: ${msg.from}
      TemplateId: ${msg.templateId}
    `);

    const [response] = await sgMail.send(msg);
    
    console.log(`Email sent successfully to ${emailData.to}`);
    console.log(`SendGrid response status code: ${response?.statusCode}`);
    
    return true;
  } catch (err) {
    console.error('Error sending email via SendGrid:', err);
    
    // Type check and handle the error object
    const error = err as any;
    if (error.response) {
      console.error('SendGrid API error response:');
      console.error(`Status code: ${error.response.status}`);
      console.error(`Body: ${JSON.stringify(error.response.body, null, 2)}`);
      console.error(`Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
    }
    
    return false;
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

  console.log(`Sending invitation email to ${invitation.email} using template ${templateId}`);
  console.log('Email data:', JSON.stringify(emailData, null, 2));

  // Add token verification logging
  const invitationLinkUrl = new URL(emailData.invitationLink);
  const pathSegments = invitationLinkUrl.pathname.split('/');
  const tokenInUrl = pathSegments[pathSegments.length - 1];
  
  console.log('⚠️ INVITATION TOKEN CHECK:');
  console.log(`- Token in database: ${invitation.token}`);
  console.log(`- Token in URL: ${tokenInUrl}`);
  console.log(`- Do they match? ${invitation.token === tokenInUrl ? 'YES ✅' : 'NO ❌'}`);

  // Match exactly what the template expects
  const dynamicTemplateData = {
    eventName: emailData.eventName,
    eventDate: emailData.eventDate,
    eventLocation: emailData.eventLocation,
    invitationLink: emailData.invitationLink,
    hostName: emailData.hostName,
    hostEmail: emailData.hostEmail
  };
  
  console.log('Template data being sent:', JSON.stringify(dynamicTemplateData, null, 2));

  const data: EmailData = {
    to: invitation.email,
    templateId: templateId,
    dynamicTemplateData
  };

  try {
    return await sendEmail(data);
  } catch (error) {
    console.error('Error in sendInvitationEmail:', error);
    return false;
  }
} 