const Ticket = require("../models/Ticket.model");
const User = require("../models/User.model");
const Property = require("../models/Property.model");
const { good, bad } = require("../lib/utils/res");
const { genAvailableWorkersSchedule } = require("../lib/utils/scheduler");
const { sendEmail } = require("../lib/emails/nodemailer");

const createTicket = async (req, res) => {
	// get the user Id from the req user
	const tenantId = req.user.userId;

	// get the tenant info
	const tenant = await User.findById(tenantId);

	// get the tenants properties from by the id
	const foundProperty = await Property.findById(tenant.propertyId);

	// get the tenants manager
	const foundManager = await User.findById(tenant.manager);

	// Get the Information from the req body
	const { type, description, priorityLevel } = req.body;

	// if any information is missing return error
	if (!type || !description || !priorityLevel) {
		return res.status(400).json({
			msg: "Please fill in all fields"
		});
	}

	// TODO: AI SOLUTION
	const solution = "AI COOL";

	// Create the new Ticket
	const newTicket = new Ticket({
		type,
		description,
		priorityLevel,
		solution,
		propertyId: foundProperty._id,
		manager: foundManager._id,
		tenantId: tenant._id
	});

	// Save the new Ticket
	const createdTicket = await Ticket.create(newTicket);

	// Send Emails
	const url = "http://localhost:4200";

	const editTicketLink = `${url}/ticket/${createdTicket._id}`;

	// Create the message
	const message = `<h2>New Ticket</h2><p>The following ticket has been created on your property.</p><br /><p> Ticket Type: ${type} <br> Priority: ${priorityLevel}<br> Tenant: ${tenant.firstName} ${tenant.lastName}<br> Property: ${foundProperty.streetAddress} ${foundProperty.aptNumber} <br>Description: ${description}. <br><p>To assign a worker, please click <a href="${editTicketLink}">here</a>.`;

	// Send the email
	await sendEmail({ to: foundManager.email, subject: "New Ticket Created", html: message });
	// return good
	res.status(201).json({ success: true, data: { createdTicket } });
};
const deleteTicket = async (req, res) => {
	const { id: ticketId } = req.params;
	if (!ticketId) {
		bad({ res, status: 400, message: "Ticket ID is required" });
	}
	const ticket = await Ticket.findByIdAndDelete({ _id: ticketId });
	if (!ticket) {
		bad({ res, status: 404, message: `No ticket found with id: ${ticketId}` });
	}
	good({ res, status: 200, data: ticket });
};
const updateTicket = async (req, res) => {
	const { id: ticketID } = req.params;

	const { progress } = req.body;
	console.log("req.body:", req.body);

	// If the ticket is blocked, please send these emails
	if (progress === "Blockage") {
		const foundTicket = await Ticket.findById(ticketID);
		const foundManager = await User.findById(foundTicket.manager);
		const foundTenant = await User.find({ _id: foundTicket.tenantId });
		const foundProperty = await Property.find({ _id: foundTicket.propertyId });

		const url = "http://localhost:4200";
		const editTicketLink = `${url}/ticket/${foundTicket._id}`;

		// create email message (address, apt, ticket description)
		const managerMessage = `<h2>Ticket Re-assignment NEEDED</h2><p>The following ticket has been incompleted(blocked) and returned to you for re-assignment.</p><br /><p> Ticket Type: ${foundTicket.type} <br> Priority: ${foundTicket.priorityLevel}<br> Tenant: ${foundTenant[0].firstName} ${foundTenant[0].lastName}<br> Property: ${foundProperty[0].streetAddress} ${foundProperty[0].aptNumber} <br>Description: ${foundTicket.description}. <br><p>To re-assign ticket, please click <a href="${editTicketLink}">here</a>.`;

		// Send the email
		await sendEmail({
			to: foundManager.email,
			subject: "Ticket re-Assignment NEEDED",
			html: managerMessage
		});

		// create email message (address, apt, ticket description)
		const tenantMessage = `<h2>Ticket Blocked - Reassignment Coming Soon</h2><p>The following ticket has been blocked and will be re-assigned. For additional information, please contact your property manager.</p><br /><p> Ticket Type: ${foundTicket.type} <br> Priority: ${foundTicket.priorityLevel}<br> Tenant: ${foundTenant[0].firstName} ${foundTenant[0].lastName}<br> Property: ${foundProperty[0].streetAddress} ${foundProperty[0].aptNumber} <br>Description: ${foundTicket.description}.`;

		// Send the email
		await sendEmail({
			to: foundTenant[0].email,
			subject: "Ticket Blocked - Reassignment coming soon",
			html: tenantMessage
		});
	}

	if (progress === "Completed") {
		const foundTicket = await Ticket.findById(ticketID);
		const foundManager = await User.findById(foundTicket.manager);
		const foundTenant = await User.find({ _id: foundTicket.tenantId });
		const foundProperty = await Property.find({ _id: foundTicket.propertyId });

		const url = "http://localhost:4200";
		const editTicketLink = `${url}/ticket/${foundTicket._id}`;

		// create email message (address, apt, ticket description)
		const managerMessage = `<h2>Ticket COMPLETED</h2><p>The following ticket has been completed.</p><br /><p> Ticket Type: ${foundTicket.type} <br> Priority: ${foundTicket.priorityLevel}<br> Tenant: ${foundTenant[0].firstName} ${foundTenant[0].lastName}<br> Property: ${foundProperty[0].streetAddress} ${foundProperty[0].aptNumber} <br>Description: ${foundTicket.description}. <br><p>To re-assign ticket, please click <a href="${editTicketLink}">here</a>.`;

		// Send the email
		await sendEmail({
			to: foundManager.email,
			subject: "Ticket COMPLETED",
			html: managerMessage
		});

		// create email message (address, apt, ticket description)
		const tenantMessage = `<h2>Ticket Completed</h2><p>The following ticket has been completed. If you continue to have issues, please contact your property manager, or submit a new ticket.</p><br /><p> Ticket Type: ${foundTicket.type} <br> Priority: ${foundTicket.priorityLevel}<br> Tenant: ${foundTenant[0].firstName} ${foundTenant[0].lastName}<br> Property: ${foundProperty[0].streetAddress} ${foundProperty[0].aptNumber} <br>Description: ${foundTicket.description}.`;

		// Send the email
		await sendEmail({
			to: foundTenant[0].email,
			subject: "Ticket COMPLETED - Thank you",
			html: tenantMessage
		});
	}

	const ticket = await Ticket.findByIdAndUpdate({ _id: ticketID }, req.body, {
		new: true,
		runValidators: true
	});

	console.log(ticket);

	good({ res, status: 200, data: ticket });
};
const assignWorker = async (req, res) => {
	const { id: ticketID } = req.params;
	const { assignedWorker } = req.body;
	const ticket = await Ticket.findByIdAndUpdate(
		{ _id: ticketID },
		{ assignedWorker, progress: "In-Progress" },
		{
			new: true,
			runValidators: true
		}
	);

	const foundWorker = await User.findById(assignedWorker);
	const foundTicket = await Ticket.findById(ticketID);
	const foundTenant = await User.find({ _id: foundTicket.tenantId });
	const foundProperty = await Property.find({ _id: foundTicket.propertyId });

	const url = "http://localhost:4200";
	const editTicketLink = `${url}/ticket/${foundTicket._id}`;

	// create email message (address, apt, ticket description)

	// create email message (address, apt, ticket description)
	const workerMessage = `<h2>Ticket Assignment</h2><p>The following ticket has been assigned to you.</p><br /><p> Ticket Type: ${foundTicket.type} <br> Priority: ${foundTicket.priorityLevel}<br> Tenant: ${foundTenant[0].firstName} ${foundTenant[0].lastName}<br> Property: ${foundProperty[0].streetAddress} ${foundProperty[0].aptNumber} <br>Description: ${foundTicket.description}. <br><p>To edit ticket, please click <a href="${editTicketLink}">here</a>.`;

	// Send the email
	await sendEmail({ to: foundWorker.email, subject: "Ticket Assignment", html: workerMessage });

	// create email message (address, apt, ticket description)
	const tenantMessage = `<h2>Ticket Assignment Notification</h2><p>The following ticket has been assigned. ${foundWorker.name} should be in touch soon.</p><br /><p> Ticket Type: ${foundTicket.type} <br> Priority: ${foundTicket.priorityLevel}<br> Tenant: ${foundTenant[0].firstName} ${foundTenant[0].lastName}<br> Property: ${foundProperty[0].streetAddress} ${foundProperty[0].aptNumber} <br>Description: ${foundTicket.description}.`;
	//

	// Send the email
	await sendEmail({
		to: foundTenant[0].email,
		subject: "Ticket Assignment",
		html: tenantMessage
	});

	// return good

	res.status(200).json({ success: true, data: { ticket } });
};
const getTicket = async (req, res) => {
	const { id: ticketID } = req.params;
	const ticket = await Ticket.findOne({ _id: ticketID });
	if (!ticket) {
		return res.status(404).json({ msg: `No ticket found with id: ${ticketID}` });
	}
	//  Property Address and APT. Number
	const foundProperty = await Property.findById(ticket.propertyId);
	// Worker Name
	const foundWorker = await User.findById(ticket.assignedWorker);
	// Tenant Name
	const foundTenant = await User.findById(ticket.tenantId);

	if (!ticket) {
		bad({ res, status: 404, message: `No ticket found with id: ${ticketId}` });
	}

	res.status(200).json({
		success: true,
		data: {
			ticket: {
				progress: ticket.progress,
				description: ticket.description,
				type: ticket.type,
				priorityLevel: ticket.priorityLevel,
				propertyId: `${foundProperty.streetAddress} Unit: ${foundProperty.aptNumber}`,
				assignedWorker: `${foundWorker.firstName} ${foundWorker.lastName}`,
				tenantId: `${foundTenant.firstName} ${foundTenant.lastName}`
			}
		}
	});
};

const getAllTickets = async (req, res) => {
	// get the user id from the req user
	const userId = req.user.userId;

	const userRole = req.user.role;

	let tickets = [];

	if (userRole === "MANAGER") {
		tickets = await Ticket.find({ manager: userId });
	}

	if (userRole === "WORKER") {
		tickets = await Ticket.find({ assignedWorker: userId });
	}

	good({ res, status: 200, data: tickets });
};

module.exports = {
	createTicket,
	deleteTicket,
	updateTicket,
	getTicket,
	getAllTickets,
	assignWorker
};
