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

    async getTicketsByUserContext(context) {
        return await ticketRepository.findByUserContext(context);
    }

    async getTicketByPaymentId(paymentId) {
        return await ticketRepository.findByPaymentId(paymentId);
    }

    async findExistingForPayment(match) {
        return await ticketRepository.findExistingForPayment(match);
    }

    async getTicketByCode(ticketCode) {
        return await ticketRepository.model.findOne({ code: ticketCode });
    }
}

export default new TicketService();
