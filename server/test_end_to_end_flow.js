const { initDB, get } = require('./database/db');
const Ticket = require('./models/Ticket');
const Notification = require('./models/Notification');
const Comment = require('./models/Comment');

async function runEndToEndSimulation() {
  console.log('Running 3-Role Workflow Test...');

  await initDB();

  const employee = await get(`SELECT * FROM Users WHERE Email = 'anushka@company.com'`);

  const newTicket = await Ticket.create({
    Title: 'Dual monitor display not recognized after docking station driver update',
    Description: 'Connected Dell Thunderbolt dock but external screens stay black. Need IT assistance.',
    CategoryId: 1,
    Priority: 'High',
    RequesterId: employee.UserId
  });

  const itStaffList = await Ticket.getStaffAvailability('IT');
  const freeStaff = itStaffList.find(s => s.isAvailable) || itStaffList[0];

  await Ticket.update(newTicket.TicketId, {
    AssigneeId: freeStaff.UserId,
    Status: 'Assigned'
  });

  await Ticket.requestStatus(newTicket.TicketId, {
    requestedStatus: 'In Progress',
    staffUserId: freeStaff.UserId,
    notes: 'Inspected dock connection. Flashing firmware to v2.1.'
  });

  await Ticket.approveStatus(newTicket.TicketId);

  await Ticket.requestStatus(newTicket.TicketId, {
    requestedStatus: 'Resolved',
    staffUserId: freeStaff.UserId,
    notes: 'Updated DisplayLink drivers and dock firmware v2.1. Dual 4K monitors verified working at 60Hz.'
  });

  await Ticket.approveStatus(newTicket.TicketId);

  const employeeView = await Ticket.findById(newTicket.TicketId);
  const comments = await Comment.findByTicketId(newTicket.TicketId);
  const resolutionNote = comments.find(c => c.IsResolutionNote);

  console.log(`Ticket #${employeeView.TicketId}: [${employeeView.Status}] - Handled by: ${employeeView.AssigneeName}`);
  console.log(`Resolution Note: "${resolutionNote?.Notes}"`);
  console.log('End-to-End Workflow test passed successfully.');

  process.exit(0);
}

runEndToEndSimulation().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
