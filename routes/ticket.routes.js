const router = require("express").Router();
const {
	createTicket,
	deleteTicket,
	updateTicket,
	getTicketById,
	getAllTickets
} = require("../controllers/ticket.controller");

router.post("/create", createTicket);
router.delete("/delete/:id", deleteTicket);
router.patch("/edit/:id", updateTicket);
router.get("/all", getAllTickets);
router.get("/find/:id", getTicketById);

module.exports = router;
