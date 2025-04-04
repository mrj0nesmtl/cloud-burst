import sgMail from '@sendgrid/mail'

// Types
interface EventDetails {
  name: string;
  date: string;
  location?: string;
  description?: string;
}

interface SendEventInvitationParams {
  to: string;
  eventDetails: EventDetails;
  invitationToken: string;
  template?: string;
}

// Initialize SendGrid
if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not defined');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEventInvitation = async ({
  to,
  eventDetails,
  invitationToken,
  template = 'event-invitation'
}: SendEventInvitationParams): Promise<[sgMail.ClientResponse, {}]> => {
  if (!process.env.SENDGRID_FROM_EMAIL) {
    throw new Error('SENDGRID_FROM_EMAIL is not defined');
  }

  if (!process.env.SENDGRID_TEMPLATE_ID) {
    throw new Error('SENDGRID_TEMPLATE_ID is not defined');
  }

  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    throw new Error('NEXT_PUBLIC_BASE_URL is not defined');
  }

  return sgMail.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    templateId: process.env.SENDGRID_TEMPLATE_ID,
    dynamicTemplateData: {
      eventName: eventDetails.name,
      eventDate: eventDetails.date,
      eventLocation: eventDetails.location,
      eventDescription: eventDetails.description,
      invitationLink: `${process.env.NEXT_PUBLIC_BASE_URL}/invitation/${invitationToken}`,
    }
  });
}
