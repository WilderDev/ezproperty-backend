// * IMPORTS
const User = require("../models/User.model");

// * CONTROLLERS
//create update delete ticket
const createTicket = async (req, res) => {};
const updateTicket = async (req, res) => {};
const deleteTicket = async (req, res) => {};

//get tickets
const getAllTickets = async (req, res) => {};
const getTicketById = async (req, res) => {};
const getTicketsByDateCreated = async (req, res) => {};
const getTicketsByDateClosed = async (req, res) => {};
const getTicketsByDateScheduled = async (req, res) => {};
const getTicketsByStatus = async (req, res) => {};
const getTicketsByPriority = async (req, res) => {};
const getOpenTicketsByPriority = async (req, res) => {};
const getAllTicketsByPropertyId = async (req, res) => {};
const getOpenTicketsByPropertyId = async (req, res) => {};
const getClosedTicketsByPropertyId = async (req, res) => {};
const getOpenTicketsByTypeWork = async (req, res) => {};
const getClosedTicketsByTypeWork = async (req, res) => {};
const getAllTicketsByTypeWork = async (req, res) => {};
const getOpenTicketsByWorkerId = async (req, res) => {};
const getClosedTicketsByWorkerId = async (req, res) => {};

//assign unassign worker to ticket
const assignWorkerToTicketManually = async (req, res) => {};
const assignWorkerToTicketByPriority = async (req, res) => {};
const assignWorkerToTicketByAvailability = async (req, res) => {};
const unassignWorkerFromTicket = async (req, res) => {};

//update ticket
const updateTicketTypeWorkAdd = async (req, res) => {};
const updateTicketTypeWorkRemove = async (req, res) => {};
const updateTicketDateScheduled = async (req, res) => {};
const updateTicketStatus = async (req, res) => {};
const updateTicketPriority = async (req, res) => {};

// * EXPORTS
module.exports = {};
