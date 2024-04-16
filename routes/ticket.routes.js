const router = require("express").Router();
const { authenticateUser } = require("../middleware/auth.middleware");

const {
	createTicket,
	deleteTicket,
	updateTicket,
	getTicket,
	getAllTickets,
	assignWorker,
	blockedTicket,
	completedTicket
} = require("../controllers/ticket.controller");

router.post("/create", authenticateUser, createTicket);
router.delete("/delete/:id", authenticateUser, deleteTicket);
router.patch("/edit/:id", authenticateUser, updateTicket);
router.get("/all", authenticateUser, getAllTickets);
router.get("/find/:id", authenticateUser, getTicket);
router.post("/edit/assign/:id", authenticateUser, assignWorker);
router.post("/edit/blockage/:id", authenticateUser, blockedTicket);
router.post("/edit/completed/:id", authenticateUser, completedTicket);

module.exports = router;
