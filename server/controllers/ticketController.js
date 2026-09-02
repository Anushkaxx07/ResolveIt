const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const SmartClassifier = require('../models/SmartClassifier');

const getTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.findAll(req.query);
    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    next(error);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: `Ticket #${id} not found` });
    }

    const comments = await Comment.findByTicketId(id);

    res.status(200).json({
      success: true,
      data: {
        ...ticket,
        comments
      }
    });
  } catch (error) {
    next(error);
  }
};

const createTicket = async (req, res, next) => {
  try {
    const { Title, Description, CategoryId, Priority, RequesterId } = req.body;

    if (!Title || Title.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Ticket Title is required' });
    }

    if (!Description || Description.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Ticket Description is required' });
    }

    const prediction = SmartClassifier.predict({ title: Title, description: Description });
    const finalCategory = CategoryId || prediction.categoryId;
    const finalPriority = Priority || prediction.suggestedPriority;
    const requester = RequesterId || 1;

    const created = await Ticket.create({
      Title,
      Description,
      CategoryId: finalCategory,
      Priority: finalPriority,
      RequesterId: requester
    });

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: created,
      smartPrediction: prediction
    });
  } catch (error) {
    next(error);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Status, Priority, AssigneeId, CategoryId } = req.body;

    const existing = await Ticket.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Ticket #${id} not found` });
    }

    const updated = await Ticket.update(id, { Status, Priority, AssigneeId, CategoryId });

    res.status(200).json({
      success: true,
      message: `Ticket #${id} updated successfully`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const requestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { requestedStatus, staffUserId, notes } = req.body;

    if (!requestedStatus) {
      return res.status(400).json({ success: false, message: 'Requested status is required' });
    }

    const updated = await Ticket.requestStatus(id, {
      requestedStatus,
      staffUserId: staffUserId || 5,
      notes
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: `Ticket #${id} not found` });
    }

    res.status(200).json({
      success: true,
      message: `Status transition request for "${requestedStatus}" sent to Support Staff.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const approveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Ticket.approveStatus(id);

    if (!updated) {
      return res.status(404).json({ success: false, message: `Ticket #${id} not found or has no pending request` });
    }

    res.status(200).json({
      success: true,
      message: `Status request approved. Ticket is now "${updated.Status}".`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const rejectStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const updated = await Ticket.rejectStatus(id, reason);

    if (!updated) {
      return res.status(404).json({ success: false, message: `Ticket #${id} not found` });
    }

    res.status(200).json({
      success: true,
      message: 'Status request rejected.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const getStaffAvailability = async (req, res, next) => {
  try {
    const { department } = req.query;
    const staff = await Ticket.getStaffAvailability(department);
    res.status(200).json({ success: true, count: staff.length, data: staff });
  } catch (error) {
    next(error);
  }
};

const closeTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ResolutionNotes, UserId } = req.body;

    const existing = await Ticket.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Ticket #${id} not found` });
    }

    await Ticket.close(id);

    if (ResolutionNotes && ResolutionNotes.trim().length > 0) {
      const commentUserId = UserId || existing.AssigneeId || 11;
      await Comment.create({
        TicketId: id,
        UserId: commentUserId,
        Notes: ResolutionNotes.trim(),
        IsResolutionNote: true
      });
    }

    res.status(200).json({
      success: true,
      message: `Ticket #${id} closed successfully`
    });
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Notes, UserId, IsResolutionNote } = req.body;

    if (!Notes || Notes.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment text cannot be empty' });
    }

    const existing = await Ticket.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: `Ticket #${id} not found` });
    }

    const createdComment = await Comment.create({
      TicketId: id,
      UserId: UserId || 11,
      Notes,
      IsResolutionNote: Boolean(IsResolutionNote)
    });

    res.status(201).json({
      success: true,
      message: 'Comment added',
      data: createdComment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  requestStatus,
  approveStatus,
  rejectStatus,
  getStaffAvailability,
  closeTicket,
  addComment
};
