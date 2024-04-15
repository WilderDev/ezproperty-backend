const Ticket = require("../models/Ticket.model");
const User = require("../models/User.model");
const Property = require("../models/Property.model");

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

	// TODO: Assign the worker
	const worker = "661c24dc3e9e765d035c3d1a";

	// TODO: AI SOLUTION
	const solution = "AI COOL";

	// Create the new Ticket
	const newTicket = new Ticket({
		type,
		description,
		priorityLevel,
		solution,
		propertyId: foundProperty._id,
		assignedWorker: worker,
		manager: foundManager._id,
		tenantId: tenant._id
	});

	// Save the new Ticket
	const createdTicket = await Ticket.create(newTicket);

	// return good
	res.status(201).json({ success: true, data: { createdTicket } });
};
const deleteTicket = async (req, res) => {
	const { id: ticketID } = req.params;
	const ticket = await Ticket.findByIdAndDelete({ _id: ticketID });

	if (!ticket) {
		return res.status(404).json({ msg: `No ticket with id: ${ticket}` });
	}

	res.status(200).json({ success: true, data: { ticket } });
};
const updateTicket = async (req, res) => {
	const { id: ticketID } = req.params;
	const ticket = await Ticket.findByIdAndUpdate({ _id: ticketID }, req.body, {
		new: true,
		runValidators: true
	});

	console.log(ticket);

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

	res.status(200).json({
		success: true,
		data: {
			ticket: {
				progress: ticket.progress,
				description: ticket.description,
				type: ticket.type,
				priorityLevel: ticket.priorityLevel,
				propertyId: `${foundProperty.streetAddress} ${foundProperty.aptNumber}`,
				assignedWorker: `${foundWorker.firstName} ${foundWorker.lastName}`,
				tenantId: `${foundTenant.firstName} ${foundTenant.lastName}`
			}
		}
	});
};

const getAllTickets = async (req, res) => {
	// get the user id from the req user
	const userId = req.user.userId;

	const tickets = await Ticket.find({ manager: userId });

	res.status(200).json({ success: true, data: { tickets } });
};

module.exports = { createTicket, deleteTicket, updateTicket, getTicket, getAllTickets };
