import dotenv from 'dotenv';
dotenv.config();

export const config = {
    MONGO_TESTURI: process.env.MONGO_TESTURI,
    MONGO_URI: process.env.MONGO_URI, 
    PORT: process.env.PORT,
    jwtSecret: process.env.JWT_SECRET,
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioPhone: process.env.TWILIO_PHONE,
    adminPhone: process.env.ADMIN_PHONE,
    mpAccessToken: process.env.MP_ACCESS_TOKEN,
    mpPublicKey: process.env.MP_PUBLIC_KEY,
    mpWebhookSecret: process.env.MP_WEBHOOK_SECRET,
    mpNotificationUrl: process.env.MP_NOTIFICATION_URL,
    mpSuccessUrl: process.env.MP_SUCCESS_URL,
    mpFailureUrl: process.env.MP_FAILURE_URL,
    mpPendingUrl: process.env.MP_PENDING_URL
};
