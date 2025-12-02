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

export const sendPurchaseEmail = async (userEmail, ticket, items = []) => {
  const currency = ticket.currency || 'ARS';
  const paymentMethod = ticket.payment_method || 'N/D';
  const paymentStatus = ticket.payment_status || 'approved';
  const installments = ticket.installments ? `${ticket.installments} cuotas` : '1 cuota';

  const itemsHtml = Array.isArray(items) && items.length
    ? `
      <h3 style="margin:16px 0 8px;">Detalle de productos</h3>
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left; padding:6px 4px; border-bottom:1px solid #ddd;">Producto</th>
            <th style="text-align:center; padding:6px 4px; border-bottom:1px solid #ddd;">Cantidad</th>
            <th style="text-align:right; padding:6px 4px; border-bottom:1px solid #ddd;">Precio</th>
            <th style="text-align:right; padding:6px 4px; border-bottom:1px solid #ddd;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => {
            const price = Number(item.price) || 0;
            const qty = Number(item.quantity) || 0;
            const subtotal = price * qty;
            return `
              <tr>
                <td style="padding:6px 4px; border-bottom:1px solid #f0f0f0;">${item.title || item.product || 'Producto'}</td>
                <td style="padding:6px 4px; text-align:center; border-bottom:1px solid #f0f0f0;">${qty}</td>
                <td style="padding:6px 4px; text-align:right; border-bottom:1px solid #f0f0f0;">$${price.toLocaleString('es-AR')}</td>
                <td style="padding:6px 4px; text-align:right; border-bottom:1px solid #f0f0f0;">$${subtotal.toLocaleString('es-AR')}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `
    : '<p>Revisa tu cuenta para ver el detalle de productos.</p>';

  const receiptHtml = ticket.receipt_url
    ? `<p style="margin:12px 0;"><a href="${ticket.receipt_url}" target="_blank">Ver comprobante</a></p>`
    : '';

  const mailOptions = {
    from: `"Ecommerce App" <${process.env.MAIL_USER}>`,
    to: userEmail,
    subject: "Confirmacion de compra - Ticket generado",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #333;">
        <h2 style="margin-bottom:8px;">Gracias por tu compra!</h2>
        <p style="margin:4px 0;"><strong>Codigo del Ticket:</strong> ${ticket.code}</p>
        <p style="margin:4px 0;"><strong>Fecha:</strong> ${new Date(ticket.purchase_datetime).toLocaleString()}</p>
        <p style="margin:4px 0;"><strong>Total pagado:</strong> $${Number(ticket.amount).toLocaleString('es-AR')} ${currency}</p>
        <p style="margin:4px 0;"><strong>Medio de pago:</strong> ${paymentMethod} | <strong>Cuotas:</strong> ${installments}</p>
        <p style="margin:4px 0;"><strong>Estado del pago:</strong> ${paymentStatus}</p>
        ${receiptHtml}
        ${itemsHtml}
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error al enviar el correo:", error);
  }
};
