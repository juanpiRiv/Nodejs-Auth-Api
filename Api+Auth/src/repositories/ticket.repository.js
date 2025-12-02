import mongoose from 'mongoose';
import Ticket from '../dao/models/Ticket.model.js';
class TicketRepository {
  constructor(ticketModel) {
    this.model = ticketModel;
  }
  async create(data) {
    return this.model.create(data);
  }
  async findById(id) {
    return this.model.findById(id);
  }
  async findByPaymentId(paymentId) {
    return this.model.findOne({ payment_id: paymentId });
  }
  async findExistingForPayment({ paymentId, preferenceId, externalReference }) {
    const orFilters = [];
    if (paymentId) orFilters.push({ payment_id: paymentId });
    if (preferenceId) orFilters.push({ preference_id: preferenceId });
    if (externalReference) orFilters.push({ external_reference: externalReference });
    if (!orFilters.length) return null;
    return this.model.findOne({ $or: orFilters });
  }
  async update(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }
  async delete(id) {
    return this.model.findByIdAndDelete(id);
  }

  async findByUserContext({ email, cartId, userId }) {
    const orFilters = [];
    const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const emailNormalized = email?.trim?.() || null;
    const emailRegex = emailNormalized ? { $regex: `^\\s*${escapeRegex(emailNormalized)}\\s*$`, $options: 'i' } : null;
    if (userId) {
      const userFilter = mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : userId;
      orFilters.push({ user: userFilter });
    }
    if (email) {
      orFilters.push({ purchaser: emailRegex || emailNormalized });
      orFilters.push({ payer_email: emailRegex || emailNormalized });
    }
    if (cartId) {
      const cartStr = String(cartId);
      orFilters.push({ external_reference: cartStr });
    }
    if (!orFilters.length) return [];
    return this.model.find({ $or: orFilters });
  }

  async findByExternalReference(cartId) {
    if (!cartId) return [];
    return this.model.find({ external_reference: String(cartId) });
  }
}

export default new TicketRepository(Ticket);
