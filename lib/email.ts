import { Resend } from 'resend';

export async function sendVenueEmail(
  to: string,
  subject: string,
  emailBody: string,
  from: string = process.env.EMAIL_FROM || 'onboarding@resend.dev'
) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      replyTo: 'reply@aisle-weddings.com',
      html: emailBody.replace(/\n/g, '<br>'),
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message);
    }

    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('Email sending failed:', error);
    throw new Error(error.message || 'Failed to send email');
  }
}
