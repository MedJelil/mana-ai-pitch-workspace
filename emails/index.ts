import { Resend } from "resend";
import { OtpVerification } from "./template/EmailVerification";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

const fromEmail = process.env.RESEND_FROM_EMAIL;

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(email: string, otp: string) {
  if (!fromEmail) {
    throw new Error("RESEND_FROM_EMAIL is not set");
  }
  const { data, error } = await resend.emails.send({
    from: `Mana AI <${fromEmail}>`,
    to: [email],
    subject: "Mana AI – Your verification code",
    react: OtpVerification({ otp }),
  });
  if (error) {
    throw new Error(error.message);
  }

  return data;
}
