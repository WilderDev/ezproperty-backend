const Ticket = require("../models/Ticket.model");
const User = require("../models/User.model")
const Property = require("../models/Property.model")

const createTicket = async (req, res) => {
	const ticket = await Ticket.create(req.body);

	res.status(200).json({ success: true, data: { ticket } });
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
// const getTicket = async (req, res) => {
// 	const { id: ticketID } = req.params;
// 	const ticket = await Ticket.findOne({ _id: ticketID });

// 	if (!ticket) {
// 		return res.status(404).json({ msg: `No ticket found with id: ${ticketID}` });
// 	}

// 	res.status(200).json({ success: true, data: { ticket } });
// };

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

	console.log(foundTenant)
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

	res.status(200).json({ success: true, data: { tickets } });
};

module.exports = { createTicket, deleteTicket, updateTicket, getTicket, getAllTickets };
