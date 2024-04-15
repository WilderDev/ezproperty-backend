const Ticket = require("../models/Ticket.model");
const User = require("../models/User.model");
const Property = require("../models/Property.model");
const { good, bad } = require("../utils/response");
const { genAvailableWorkersSchedule } = require("../utils/workerSchedule");

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
	const { id: ticketId } = req.params;
	const ticket = await Ticket.findByIdAndUpdate({ _id: ticketId }, req.body, {
		new: true,
		runValidators: true
	});

	console.log(ticket);

	good({ res, status: 200, data: ticket });
};
const getTicket = async (req, res) => {
	const { id: ticketId } = req.params;
	const ticket = await Ticket.findOne({ _id: ticketId });

	if (!ticket) {
		bad({ res, status: 404, message: `No ticket found with id: ${ticketId}` });
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
	const tickets = await Ticket.find({});

	good({ res, status: 200, data: tickets });
};

const assignWorkerManual = async (req, res) => {
	const { id: ticketId } = req.params;
	const { workerId } = req.body;
	const ticket = await Ticket.findOne({ _id: ticketId });
	const worker = await User.findOne({ _id: workerId });
	ticket.assignedWorker = worker;
	await ticket.save();
	good({ res, status: 200, data: ticket });
};

const assignWorkerAuto = async (req, res) => {
	const { id: ticketId } = req.params; // get ticket id from params
	const { expectedTimeslots, currentTime } = req.body; // get expected timeslots from body
	//TODO convert currentTime to day and timeslot in ISO format
	const ticket = await Ticket.findOne({ _id: ticketId }); // find ticket by id
	const { workerStartTimes, needsRescheduled } = genAvailableWorkersSchedule(ticketId, expectedTimeslots); // get available workers schedule object
	const needsRescheduledAvailableWorkers = {}; // create object to store the available schedules of the workers for each ticket that needs to be rescheduled

	if (ticket.priorityLevel === "LOW") {
		for (let [worker, startTimes] of workerStartTimes) {
			// loop through workers and their start times
			let [day, timeslots] = startTimes; // destructure day and timeslot
			for (let timeslot in timeslots) {
				// loop through timeslots
				if (timeslot >= currentTime) {
					// if timeslot is greater than or equal to current time
					ticket.assignedWorker = worker; // assign worker to ticket
					await ticket.save(); // save ticket
					good({ res, status: 200, data: ticket }); // return 200 and ticket data
				}
			}
		}
		// if the incoming ticket is of low priority
		// loop through the available workers schedule object
		// assign the worker with the earliest available timeslot to the ticket
		// if there are no available workers
		// notify the user that there are no available workers
	} else if (ticket.priorityLevel === "MEDIUM") {
		// if the incoming ticket is of medium priority
		// loop through the available workers schedule object
		// assign the worker with the earliest available timeslot to the ticket
		// if there are no available workers
		// find the worker with the earliest available timeslot ignoring any low priority tickets
		// notify the user of the ticket(s) are being reassigned
		// reassign the low priority ticket(s) to the worker with the earliest available timeslot
	} else if (ticket.priorityLevel === "HIGH") {
		// if the incoming ticket is of high priority
		// loop through the available workers schedule object
		// assign the worker with the earliest available timeslot to the ticket
		// if there are no available workers
		// find the worker with the earliest available timeslot ignoring any low or medium priority tickets or timeslots scheduled for null
		// notify the user of the ticket(s) are being reassigned
		// reassign the low and medium priority ticket(s) to the worker with the earliest available timeslot
	}

	for (let ticket of needsRescheduled) {
		// loop through tickets that need to be rescheduled
		let foundTicket = await Ticket.findOne({ _id: ticket }); // find ticket by id
		if (!foundTicket) {
			//TODO no ticket found
		}
		const { availableWorkersSchedule } = genAvailableWorkersSchedule(ticket, foundTicket.expectedTimeslots); // get available workers schedule object for the ticket which is being rescheduled
		needsRescheduledAvailableWorkers[ticket] = availableWorkersSchedule; // in the needsRescheduledAvailableWorkers object, set the available workers schedule object for the ticket which is being rescheduled
	}
};

const getAvailableWorkers = async (req, res) => {
	const { ticketId } = req.params;
	const { expectedTimeslots } = req.body;
	const availableWorkersSchedule = genAvailableWorkersSchedule(ticketId, expectedTimeslots);
	good({ res, status: 200, data: availableWorkersSchedule });
};

module.exports = {
	createTicket,
	deleteTicket,
	updateTicket,
	getTicket,
	getAllTickets,
	assignWorkerManual,
	assignWorkerAuto,
	getAvailableWorkers
};
