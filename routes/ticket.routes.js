const router = require("express").Router();
const {
	createTicket,
	deleteTicket,
	updateTicket,
	getTicket,
	getAllTickets
} = require("../controllers/ticket.controller");

router.post("/create", createTicket);
router.delete("/delete/:id", deleteTicket);
router.patch("/edit/:id", updateTicket);
router.get("/all", getAllTickets);
router.get("/find/:id", getTicket);

module.exports = router;
