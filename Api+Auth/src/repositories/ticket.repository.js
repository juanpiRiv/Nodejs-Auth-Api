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
  async update(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }
  async delete(id) {
    return this.model.findByIdAndDelete(id);
  }
}

export default new TicketRepository(Ticket);
