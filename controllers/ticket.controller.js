// * IMPORTS
const User = require("../models/User.model");
const Ticket = require("../models/Ticket.model");
const Property = require("../models/Property.model");
const { good, bad } = require("../utils/response");

// * CONTROLLERS
//create update delete ticket
const createTicket = async (req, res) => {
	const { propertyId, priorityLevel, type, image, description, progress } = req.body;
	if (!propertyId || !priorityLevel || !type || !description || !progress) {
		return bad(res, "Missing required fields");
	}
	const ticket = new Ticket({
		propertyId,
		priorityLevel,
		type,
		image,
		description,
		progress
	});
	if (
		(await Ticket.find({ propertyId, type, progress: "In-Progress" }).countDocuments()) >
			process.env.MAX_TICKETS_LIMIT &&
		!priorityLevel === "HIGH"
	) {
		return bad(res, "Max tickets limit reached");
	}
	await ticket.save();
	good(res, { data: ticket });
};
const updateTicket = async (req, res) => {};
const deleteTicket = async (req, res) => {};
//get tickets
const getAllTickets = async (req, res) => {};
const getTicketById = async (req, res) => {};
//get tickets by date
const getTicketsByDateCreated = async (req, res) => {};
const getTicketsByDateClosed = async (req, res) => {};
const getTicketsByDateScheduled = async (req, res) => {};
//get tickets by status
const getAllOpenTickets = async (req, res) => {};
const getOpenTicketsByStatus = async (req, res) => {};
const getClosedTickets = async (req, res) => {};
//get tickets by priority
const getAllTicketsByPriority = async (req, res) => {};
const getOpenTicketsByPriority = async (req, res) => {};
const getClosedTicketsByPriority = async (req, res) => {};
//get tickets by location
const getAllTicketsByPropertyId = async (req, res) => {};
const getOpenTicketsByPropertyId = async (req, res) => {};
const getClosedTicketsByPropertyId = async (req, res) => {};
//get tickets by type of work needed
const getAllTicketsByTypeWork = async (req, res) => {};
const getOpenTicketsByTypeWork = async (req, res) => {};
const getClosedTicketsByTypeWork = async (req, res) => {};
//get tickets by worker assigned
const getAllTicketsByWorkerId = async (req, res) => {};
const getOpenTicketsByWorkerId = async (req, res) => {};
const getClosedTicketsByWorkerId = async (req, res) => {};
//assign unassign worker to ticket
const assignWorkerToTicketManually = async (req, res) => {};
const assignWorkerToTicketAutomatically = async (req, res) => {};
const unassignWorkerFromTicket = async (req, res) => {};
//update ticket
const updateTicketTypeWorkAdd = async (req, res) => {};
const updateTicketTypeWorkRemove = async (req, res) => {};
const updateTicketDateScheduled = async (req, res) => {};
const updateTicketStatus = async (req, res) => {};
const updateTicketPriority = async (req, res) => {};

// * EXPORTS
module.exports = {
	createTicket,
	updateTicket,
	deleteTicket,
	getAllTickets,
	getTicketById,
	getTicketsByDateCreated,
	getTicketsByDateClosed,
	getTicketsByDateScheduled,
	getAllOpenTickets,
	getOpenTicketsByStatus,
	getClosedTickets,
	getAllTicketsByPriority,
	getOpenTicketsByPriority,
	getClosedTicketsByPriority,
	getAllTicketsByPropertyId,
	getOpenTicketsByPropertyId,
	getClosedTicketsByPropertyId,
	getAllTicketsByTypeWork,
	getOpenTicketsByTypeWork,
	getClosedTicketsByTypeWork,
	getAllTicketsByWorkerId,
	getOpenTicketsByWorkerId,
	getClosedTicketsByWorkerId,
	assignWorkerToTicketManually,
	assignWorkerToTicketAutomatically,
	unassignWorkerFromTicket,
	updateTicketTypeWorkAdd,
	updateTicketTypeWorkRemove,
	updateTicketDateScheduled,
	updateTicketStatus,
	updateTicketPriority
};
