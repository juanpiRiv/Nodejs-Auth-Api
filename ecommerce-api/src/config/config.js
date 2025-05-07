import dotenv from 'dotenv';
dotenv.config();

export const config = {
    MONGO_URI: process.env.MONGO_URI, 
    PORT: process.env.PORT,
    jwtSecret: process.env.JWT_SECRET,
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioPhone: process.env.TWILIO_PHONE,
    adminPhone: process.env.ADMIN_PHONE
};
