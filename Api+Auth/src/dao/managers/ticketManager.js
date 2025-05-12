
import ticketModel from '../models/Ticket.model.js'; // nombre del modelo

class TicketManager {
    async createTicket(ticketData) { // Renombrado 
        return await ticketModel.create(ticketData); // Usar el modelo correcto
    }

    //  añadir otros métodos relacionados con tickets aquí
    async getAllTickets() {
        return await ticketModel.find().lean();
    }

    async getTicketById(id) {
        return await ticketModel.findById(id).lean();
    }

    async getTicketByCode(code) {
        return await ticketModel.findOne({ code: code }).lean();
    }
}

export default new TicketManager(); // Renombrada la exportación
