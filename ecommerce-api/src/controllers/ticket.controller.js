// src/controllers/ticket.controller.js
import ticketService from '../services/ticket.service.js';
import TicketDTO from '../dtos/ticket.dto.js';

export const getTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getAllTickets();
    const ticketDTOs = tickets.map(ticket => new TicketDTO(ticket));
    res.json({ status: 'success', tickets: ticketDTOs });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Controlador para crear un nuevo ticket
export const createTicket = async (req, res) => {
  try {
    // Aquí iría la lógica para crear el ticket usando ticketService
    // Por ejemplo: const newTicketData = req.body;
    // const createdTicket = await ticketService.createTicket(newTicketData, req.user.email); // Asumiendo que el servicio lo maneja

    // Placeholder mientras se implementa la lógica completa:
    const newTicketData = req.body; // Los datos ya validados por Joi
    // Simulación de creación
    const simulatedTicket = {
      ...newTicketData,
      code: `TICKET-${Date.now()}`, // Generar un código único simple
      purchase_datetime: new Date(),
      // purchaser: req.user.email, // El purchaser ya viene en el body y fue validado
    };

    // Devolver el ticket simulado o un DTO
    res.status(201).json({ status: 'success', message: 'Ticket creado (simulado)', ticket: new TicketDTO(simulatedTicket) });

  } catch (error) {
    console.error('Error al crear ticket:', error);
    res.status(500).json({ status: 'error', message: 'Error interno al crear el ticket: ' + error.message });
  }
};

export const getTicketByCode = async (req, res) => {
  try {
    const ticket = await ticketService.getTicketByCode(req.params.code);
    if (!ticket) {
      return res.status(404).json({ status: 'error', message: 'Ticket no encontrado por código' });
    }

    // Opcional: validar que solo el usuario dueño o admin accedan
    if (ticket.purchaser !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Acceso denegado al ticket por código' });
    }

    res.json({ status: 'success', ticket: new TicketDTO(ticket) });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};


export const getTicketById = async (req, res) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.tid);
    if (!ticket) {
      return res.status(404).json({ status: 'error', message: 'Ticket no encontrado' });
    }

    // Opcional: validar que solo el usuario dueño o admin accedan
    if (ticket.purchaser !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Acceso denegado al ticket' });
    }

    res.json({ status: 'success', ticket: new TicketDTO(ticket) });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
