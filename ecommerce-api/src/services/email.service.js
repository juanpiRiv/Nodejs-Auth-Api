// src/services/email.service.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export const sendPurchaseEmail = async (userEmail, ticket) => {
  const mailOptions = {
    from: `"Ecommerce App" <${process.env.MAIL_USER}>`,
    to: userEmail,
    subject: "🎟️ Confirmación de compra - Ticket generado",
    html: `
      <h2>¡Gracias por tu compra!</h2>
      <p><strong>Código del Ticket:</strong> ${ticket.code}</p>
      <p><strong>Fecha:</strong> ${new Date(ticket.purchase_datetime).toLocaleString()}</p>
      <p><strong>Total:</strong> $${ticket.amount}</p>
      <p>Revisa tu cuenta para más detalles.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Correo enviado a:", userEmail);
  } catch (error) {
    console.error("❌ Error al enviar el correo:", error);
  }
};
