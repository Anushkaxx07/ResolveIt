const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/ticketController');

router.get('/staff/availability', getStaffAvailability);

router.route('/')
  .get(getTickets)
  .post(createTicket);

router.route('/:id')
  .get(getTicketById)
  .put(updateTicket);

router.put('/:id/request-status', requestStatus);
router.put('/:id/approve-status', approveStatus);
router.put('/:id/reject-status', rejectStatus);

router.put('/:id/close', closeTicket);
router.post('/:id/comments', addComment);

module.exports = router;
