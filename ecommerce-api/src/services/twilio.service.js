import twilio from "twilio";

let twilioClientInstance;

function getTwilioClient() {
  if (!twilioClientInstance) {
    console.log("DEBUG twilio.service.js (getClient) - Inicializando cliente Twilio AHORA.");
    console.log("DEBUG twilio.service.js (getClient) - TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID);
    console.log("DEBUG twilio.service.js (getClient) - TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN);
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error("Twilio Account SID o Auth Token no están definidos en process.env al inicializar el cliente.");
    }
    twilioClientInstance = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClientInstance;
}

export const sendPurchaseMessage = async (userPhone, ticket) => {
  const client = getTwilioClient(); // Obtener/inicializar cliente aquí
  const body = `🎟️ Compra confirmada\nTicket: ${ticket.code}\nTotal: $${ticket.amount}\nGracias por tu compra.`;

  console.log("DEBUG twilio.service.js (sendPurchaseMessage) - Enviando desde:", process.env.TWILIO_PHONE);
  if (!process.env.TWILIO_PHONE) {
    throw new Error("Twilio Phone (from) no está definido en process.env al enviar mensaje.");
  }

  return await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE,
    to: userPhone
  });
};

