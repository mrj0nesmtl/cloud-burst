import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key if available
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('SendGrid initialized successfully');
} else {
  console.warn('SENDGRID_API_KEY is not set in environment variables. Email functionality will be disabled.');
}

export interface EmailData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  from?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: 'attachment' | 'inline';
    contentId?: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: any;
}

/**
 * Sends an email using SendGrid
 * @param data Email data including recipient, subject, content, and template information
 * @returns Result of the email sending operation
 */
export async function sendEmail(data: EmailData): Promise<EmailResult> {
  if (!SENDGRID_API_KEY) {
    console.warn('Cannot send email: SENDGRID_API_KEY is not set');
    return { success: false, error: 'API key not configured' };
  }
  
  const fromEmail = data.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@cloudburst.com';
  
  try {
    // Prepare email message
    const msg: sgMail.MailDataRequired = {
      to: data.to,
      from: fromEmail,
      subject: data.subject,
    };
    
    // Handle template-based emails
    if (data.templateId) {
      msg.templateId = data.templateId;
      if (data.templateData) {
        msg.dynamicTemplateData = data.templateData;
      }
    } else {
      // Handle content-based emails
      if (data.html) {
        msg.html = data.html;
      }
      if (data.text) {
        msg.text = data.text;
      }
    }
    
    // Add attachments if any
    if (data.attachments && data.attachments.length > 0) {
      msg.attachments = data.attachments;
    }
    
    console.log(`Sending email to: ${data.to}, subject: ${data.subject}`);
    
    // Send the email
    const [response] = await sgMail.send(msg);
    
    console.log(`Email sent successfully, status code: ${response.statusCode}`);
    
    return {
      success: true,
      messageId: response.headers['x-message-id'] as string
    };
  } catch (error) {
    console.error('Error sending email via SendGrid:', error);
    
    // Type check and handle the error object
    const err = error as any;
    if (err.response) {
      console.error(`Status code: ${err.response.status}`);
      console.error(`Body: ${JSON.stringify(err.response.body, null, 2)}`);
    }
    
    return {
      success: false,
      error: err
    };
  }
}

/**
 * Mock implementation of sendEmail for development environments
 * @param data Email data
 * @returns Success status with mock message ID
 */
export async function sendEmailMock(data: EmailData): Promise<EmailResult> {
  console.log('MOCK EMAIL SERVICE');
  console.log('-----------------');
  console.log(`To: ${data.to}`);
  console.log(`Subject: ${data.subject}`);
  console.log(`Template ID: ${data.templateId || 'N/A'}`);
  
  if (data.templateData) {
    console.log('Template Data:', JSON.stringify(data.templateData, null, 2));
  }
  
  if (data.html) {
    console.log('HTML Content:', data.html.substring(0, 100) + '...');
  }
  
  if (data.text) {
    console.log('Text Content:', data.text.substring(0, 100) + '...');
  }
  
  console.log('-----------------');
  
  return {
    success: true,
    messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
  };
} 