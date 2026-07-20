const express = require("express");
const routes = express.Router();

const supportController = require("../controller/support.controller");

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

// ==========================
// User Support
// ==========================

// Create Ticket
routes.post(
  "/create-ticket",
  authMiddleware.authMiddleware,
  supportController.createTicket
);

// Get My Tickets
routes.get(
  "/my-tickets",
  authMiddleware.authMiddleware,
  supportController.getMyTickets
);

// Get Single Ticket
routes.get(
  "/ticket/:ticketId",
  authMiddleware.authMiddleware,
  supportController.getSingleTicket
);

// Reply To Ticket
routes.post(
  "/reply/:ticketId",
  authMiddleware.authMiddleware,
  supportController.replyTicket
);

// ==========================
// Admin Support
// ==========================

// Get All Tickets
routes.get(
  "/all-tickets",
  authMiddleware.authMiddleware,
  adminMiddleware,
  supportController.getAllTickets
);

// Change Ticket Status
routes.patch(
  "/status/:ticketId",
  authMiddleware.authMiddleware,
  adminMiddleware,
  supportController.updateTicketStatus
);

// Assign Ticket
routes.patch(
  "/assign/:ticketId",
  authMiddleware.authMiddleware,
  adminMiddleware,
  supportController.assignTicket
);

// Delete Ticket
routes.delete(
  "/:ticketId",
  authMiddleware.authMiddleware,
  adminMiddleware,
  supportController.deleteTicket
);

module.exports = routes;