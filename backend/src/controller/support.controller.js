const supportTicketModel = require("../models/supportTicket.model");
const supportMessageModel = require("../models/supportMessage.model");
const userModel = require("../models/user.models");

const { uploadFile } = require("../service/storage.service");

const {
  createNotification,
  createBulkNotifications,
} = require("../utils/createNotification");

// ==========================
// Create Support Ticket
// ==========================

async function createTicket(req, res) {
  try {
    const { subject, description, category, priority } = req.body;

    // ==========================
    // Validation
    // ==========================

    if (!subject || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory.",
      });
    }

    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
    }

    // ==========================
    // Attachment Upload
    // ==========================

    let attachment = {
      url: "",
      fileId: "",
      fileName: "",
    };

    if (req.file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
        "application/pdf",
      ];

      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Invalid attachment format.",
        });
      }

      const uploadedFile = await uploadFile(req.file);

      attachment = {
        url: uploadedFile.url,
        fileId: uploadedFile.fileId,
        fileName: req.file.originalname,
      };
    }

    // ==========================
    // Create Ticket
    // ==========================

    const ticket = await supportTicketModel.create({
      user: user._id,

      subject: subject.trim(),

      description: description.trim(),

      category,

      priority: priority || "MEDIUM",

      status: "OPEN",

      attachment,

      lastMessage: description.trim(),

      lastMessageAt: new Date(),

      unreadForAdmin: 1,

      unreadForUser: 0,
    });

    // ==========================
    // First Chat Message
    // ==========================

    await supportMessageModel.create({
      ticket: ticket._id,

      sender: user._id,

      senderRole: user.role,

      message: description.trim(),

      attachment,
    });

    // ==========================
    // Notify Admins
    // ==========================

    const admins = await userModel.find(
      {
        role: "ADMIN",
        isBlocked: false,
      },
      {
        _id: 1,
      },
    );

    if (admins.length > 0) {
      await createBulkNotifications({
        users: admins.map((admin) => admin._id),

        title: "New Support Ticket",

        message: `${user.name} created a new support ticket.`,

        type: "SUPPORT_CREATED",

        redirectUrl: `/admin/support/${ticket._id}`,

        metadata: {
          ticketId: ticket._id,
          createdBy: user._id,
        },
      });
    }

    // ==========================
    // Notify User
    // ==========================

    await createNotification({
      user: user._id,

      title: "Support Ticket Created",

      message:
        "Your support ticket has been created successfully. Our support team will respond soon.",

      type: "SUPPORT_CREATED",

      redirectUrl: `/support/ticket/${ticket._id}`,

      metadata: {
        ticketId: ticket._id,
      },
    });

    // ==========================
    // Response
    // ==========================

    return res.status(201).json({
      success: true,
      message: "Support ticket created successfully.",
      ticket,
    });
  } catch (error) {
    console.error("Create Ticket Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

// ==========================
// Get My Tickets
// ==========================

async function getMyTickets(req, res) {
  try {
    let { page = 1, limit = 10, status } = req.query;

    page = Number(page);
    limit = Number(limit);

    const filter = {
      user: req.user._id,
    };

    if (status) {
      filter.status = status;
    }

    const totalTickets = await supportTicketModel.countDocuments(filter);

    const tickets = await supportTicketModel
      .find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      message: "Support tickets fetched successfully.",

      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalTickets / limit),
        totalTickets,
        limit,
      },

      tickets,
    });
  } catch (error) {
    console.error("Get My Tickets Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

// ==========================
// Get Single Ticket
// ==========================

async function getSingleTicket(req, res) {
  try {
    const { ticketId } = req.params;

    const ticket = await supportTicketModel
      .findById(ticketId)
      .populate("user", "name userName email profileImage");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found.",
      });
    }

    // User can access only own ticket
    if (
      ticket.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access.",
      });
    }

    const messages = await supportMessageModel
      .find({
        ticket: ticketId,
        isDeleted: false,
      })
      .populate("sender", "name userName profileImage role")
      .sort({
        createdAt: 1,
      });

    // Reset unread count

    if (req.user.role === "ADMIN") {
      ticket.unreadForAdmin = 0;
    } else {
      ticket.unreadForUser = 0;
    }

    await ticket.save({
      validateBeforeSave: false,
    });

    return res.status(200).json({
      success: true,
      message: "Support ticket fetched successfully.",
      ticket,
      messages,
    });
  } catch (error) {
    console.error("Get Ticket Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

// ==========================
// Reply Ticket
// ==========================

async function replyTicket(req, res) {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    // ==========================
    // Validation
    // ==========================

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    const ticket = await supportTicketModel.findById(ticketId);

    if (!ticket || ticket.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found.",
      });
    }

    if (ticket.status === "CLOSED") {
      return res.status(400).json({
        success: false,
        message: "This ticket has been closed.",
      });
    }

    // ==========================
    // Authorization
    // ==========================

    if (
      ticket.user.toString() !== req.user._id.toString() &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access.",
      });
    }

    // ==========================
    // Attachment
    // ==========================

    let attachment = {
      url: "",
      fileId: "",
      fileName: "",
    };

    if (req.file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
        "application/pdf",
      ];

      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Invalid attachment format.",
        });
      }

      const uploadedFile = await uploadFile(req.file);

      attachment = {
        url: uploadedFile.url,
        fileId: uploadedFile.fileId,
        fileName: req.file.originalname,
      };
    }

    // ==========================
    // Save Message
    // ==========================

    const supportMessage = await supportMessageModel.create({
      ticket: ticket._id,
      sender: req.user._id,
      senderRole: req.user.role,
      message: message.trim(),
      attachment,
    });

    // ==========================
    // Update Ticket
    // ==========================

    ticket.lastMessage = message.trim();
    ticket.lastMessageAt = new Date();

    // ==========================
    // USER Reply
    // ==========================

    if (req.user.role === "USER") {
      ticket.unreadForAdmin += 1;

      ticket.lastRepliedBy = "USER";

      if (ticket.status === "WAITING_FOR_USER") {
        ticket.status = "IN_PROGRESS";
      }

      const admins = await userModel.find(
        {
          role: "ADMIN",
          isBlocked: false,
        },
        {
          _id: 1,
        },
      );

      if (admins.length > 0) {
        await createBulkNotifications({
          users: admins.map((admin) => admin._id),

          title: "New Support Reply",

          message: `${req.user.name} replied to support ticket ${ticket.ticketNumber}.`,

          type: "SUPPORT_REPLY",

          redirectUrl: `/admin/support/${ticket._id}`,

          metadata: {
            ticketId: ticket._id,
            ticketNumber: ticket.ticketNumber,
          },
        });
      }
    }

    // ==========================
    // ADMIN Reply
    // ==========================
    else {
      ticket.unreadForUser += 1;

      ticket.lastRepliedBy = "ADMIN";

      if (!ticket.assignedTo) {
        ticket.assignedTo = req.user._id;
      }

      if (ticket.status === "OPEN" || ticket.status === "WAITING_FOR_USER") {
        ticket.status = "IN_PROGRESS";
      }

      await createNotification({
        user: ticket.user,

        title: "Support Team Replied",

        message: "Support team has replied to your support ticket.",

        type: "SUPPORT_REPLY",

        redirectUrl: `/support/ticket/${ticket._id}`,

        metadata: {
          ticketId: ticket._id,
          ticketNumber: ticket.ticketNumber,
        },
      });
    }

    await ticket.save({
      validateBeforeSave: false,
    });

    return res.status(201).json({
      success: true,
      message: "Reply sent successfully.",
      supportMessage,
    });
  } catch (error) {
    console.error("Reply Ticket Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

// ==========================
// Get All Tickets (Admin)
// ==========================

async function getAllTickets(req, res) {
  try {
    let {
      page = 1,
      limit = 10,
      status,
      priority,
      category,
      search,
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    const filter = {
      isDeleted: false,
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    if (search) {
      filter.$or = [
        {
          ticketNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          subject: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const totalTickets = await supportTicketModel.countDocuments(filter);

    const tickets = await supportTicketModel
      .find(filter)
      .populate(
        "user",
        "name userName email profileImage"
      )
      .populate(
        "assignedTo",
        "name userName"
      )
      .sort({
        updatedAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      message: "Support tickets fetched successfully.",

      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalTickets / limit),
        totalTickets,
        limit,
      },

      tickets,
    });

  } catch (error) {

    console.error("Get All Tickets Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });

  }
}

// ==========================
// Update Ticket Status
// ==========================

async function updateTicketStatus(req, res) {
  try {

    const { ticketId } = req.params;

    const { status } = req.body;

    const allowedStatus = [
      "OPEN",
      "IN_PROGRESS",
      "WAITING_FOR_USER",
      "RESOLVED",
      "CLOSED",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket status.",
      });
    }

    const ticket = await supportTicketModel.findById(ticketId);

    if (!ticket || ticket.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found.",
      });
    }

    ticket.status = status;

    if (status === "RESOLVED") {
  ticket.resolvedBy = req.user._id;
  ticket.resolvedAt = new Date();
}

    if (status === "CLOSED") {
      ticket.closedBy = req.user._id;
      ticket.closedAt = new Date();
    }

    await ticket.save({
      validateBeforeSave: false,
    });

    await createNotification({
      user: ticket.user,

      title: "Support Ticket Updated",

      message: `Your support ticket (${ticket.ticketNumber}) status has been changed to ${status}.`,

      type: "SUPPORT_REPLY",

      redirectUrl: `/support/ticket/${ticket._id}`,

      metadata: {
        ticketId: ticket._id,
        ticketNumber: ticket.ticketNumber,
        status,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Ticket status updated successfully.",
      ticket,
    });

  } catch (error) {

    console.error("Update Ticket Status Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });

  }
}

// ==========================
// Assign Ticket (Admin)
// ==========================

async function assignTicket(req, res) {
  try {
    const { ticketId } = req.params;
    const { adminId } = req.body;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required.",
      });
    }

    const ticket = await supportTicketModel.findById(ticketId);

    if (!ticket || ticket.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found.",
      });
    }

    const admin = await userModel.findOne({
      _id: adminId,
      role: "ADMIN",
      isBlocked: false,
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    ticket.assignedTo = admin._id;

    await ticket.save({
      validateBeforeSave: false,
    });

    await createNotification({
      user: admin._id,

      title: "Support Ticket Assigned",

      message: `Ticket ${ticket.ticketNumber} has been assigned to you.`,

      type: "SUPPORT_REPLY",

      redirectUrl: `/admin/support/${ticket._id}`,

      metadata: {
        ticketId: ticket._id,
        ticketNumber: ticket.ticketNumber,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Ticket assigned successfully.",
      ticket,
    });

  } catch (error) {

    console.error("Assign Ticket Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });

  }
}

// ==========================
// Delete Ticket
// ==========================

async function deleteTicket(req, res) {
  try {

    const { ticketId } = req.params;

    const ticket = await supportTicketModel.findById(ticketId);

    if (!ticket || ticket.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found.",
      });
    }

    ticket.isDeleted = true;

    await ticket.save({
      validateBeforeSave: false,
    });

    return res.status(200).json({
      success: true,
      message: "Support ticket deleted successfully.",
    });

  } catch (error) {

    console.error("Delete Ticket Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });

  }
}

module.exports = {
  createTicket,
  getMyTickets,
  getSingleTicket,
  replyTicket,
  getAllTickets,
  updateTicketStatus,
  assignTicket,
  deleteTicket,
};