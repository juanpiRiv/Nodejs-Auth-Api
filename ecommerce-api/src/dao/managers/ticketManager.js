//cambiar nombre a ticketManager.js

import ticketModel from '../models/ticket.model.js'; // Corregida la ruta y nombre del modelo

class TicketManager { // Renombrada la clase
    async createTicket(ticketData) { // Renombrado el método
        return await ticketModel.create(ticketData); // Usar el modelo correcto
    }

    // Puedes añadir otros métodos relacionados con tickets aquí
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
