const router = require("express").Router();
const { authenticateUser } = require("../middleware/auth.middleware");

const {
	createTicket,
	deleteTicket,
	updateTicket,
	getTicket,
	getAllTickets
} = require("../controllers/ticket.controller");

router.post("/create", authenticateUser, createTicket);
router.delete("/delete/:id", deleteTicket);
router.patch("/edit/:id", updateTicket);
router.get("/all", getAllTickets);
router.get("/find/:id", getTicket);

module.exports = router;
