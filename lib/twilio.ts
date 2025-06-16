// Twilio SMS verification (server-side example, use with API route or serverless function)
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

export const twilioClient = twilio(accountSid, authToken);

// Send verification code
export async function sendVerificationCode(phone: string) {
  return twilioClient.verify.v2.services(verifySid).verifications.create({ to: phone, channel: 'sms' });
}

// Check verification code
export async function checkVerificationCode(phone: string, code: string) {
  return twilioClient.verify.v2.services(verifySid).verificationChecks.create({ to: phone, code });
}
