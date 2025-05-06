import ticketManager from '../dao/managers/ticketManager.js'; // Corregida la ruta y nombre del manager de ticket

class TicketService { // Renombrada la clase
    async createTicket(ticketData) { // Renombrado el método para crear ticket
        return await ticketManager.createTicket(ticketData); // Usar el manager de ticket
    }

    // Puedes añadir otros métodos relacionados con tickets aquí
    async getAllTickets() {
        return await ticketManager.getAllTickets();
    }

    async getTicketById(ticketId) {
        return await ticketManager.getTicketById(ticketId);
    }

    async getTicketByCode(ticketCode) {
        return await ticketManager.getTicketByCode(ticketCode);
    }
}

export default new TicketService(); // Renombrada la exportación
