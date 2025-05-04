import ticketManager from '../dao/managers/ticketManager.js'; // Corregida la ruta y nombre del manager de ticket

class TicketService { // Renombrada la clase
    async createTicket(ticketData) { // Renombrado el método para crear ticket
        return await ticketManager.createTicket(ticketData); // Usar el manager de ticket
    }

    // Puedes añadir otros métodos relacionados con tickets aquí
}

export default new TicketService(); // Renombrada la exportación
