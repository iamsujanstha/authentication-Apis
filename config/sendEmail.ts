import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.RESEND_API) {
  console.warn("Provide Resend Api inside .env file")
}

const resend = new Resend(process.env.RESEND_API);

async function sendEmail({ sendTo, subject, html }: { sendTo: string, subject: string, html: string }) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Auth0 <onboarding@resend.dev>',
      to: sendTo,
      subject,
      html,
    });
    return data;


  } catch (error) {
    return console.error({ error })
  }
}
export default sendEmail;
