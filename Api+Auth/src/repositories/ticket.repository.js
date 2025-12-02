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
    if (userId) {
      orFilters.push({ user: userId });
    }
    if (email) {
      orFilters.push({ purchaser: email });
      orFilters.push({ payer_email: email });
    }
    if (cartId) {
      orFilters.push({ external_reference: String(cartId) });
    }
    if (!orFilters.length) return [];
    return this.model.find({ $or: orFilters });
  }
}

export default new TicketRepository(Ticket);
