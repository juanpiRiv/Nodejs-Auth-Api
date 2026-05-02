import ticketRepository from '../repositories/ticket.repository.js';

class TicketService {
    async createTicket(ticketData) {
        return await ticketRepository.create(ticketData);
    }

    async getAllTickets() {
        return await ticketRepository.model.find();
    }

    async getTicketById(ticketId) {
        return await ticketRepository.findById(ticketId);
    }

    async getTicketByCode(ticketCode) {
        return await ticketRepository.model.findOne({ code: ticketCode });
    }

    async getTicketByMpPaymentId(mpPaymentId) {
        return await ticketRepository.findOne({ mpPaymentId: String(mpPaymentId) });
    }
}

export default new TicketService();
