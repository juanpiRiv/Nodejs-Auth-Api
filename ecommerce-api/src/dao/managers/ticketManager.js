//cambiar nombre a ticketManager.js

import ticketModel from '../models/ticket.model.js'; // Corregida la ruta y nombre del modelo

class TicketManager { // Renombrada la clase
    async createTicket(ticketData) { // Renombrado el método
        return await ticketModel.create(ticketData); // Usar el modelo correcto
    }

    // Puedes añadir otros métodos relacionados con tickets aquí
}

export default new TicketManager(); // Renombrada la exportación
