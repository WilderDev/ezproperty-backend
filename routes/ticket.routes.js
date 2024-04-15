const router = require("express").Router();
const { authenticateUser } = require("../middleware/auth.middleware");

const {
	createTicket,
	deleteTicket,
	updateTicket,
	getTicket,
	getAllTickets,
	assignWorkerManual,
	assignWorkerAuto,
	getAvailableWorkers
} = require("../controllers/ticket.controller");

router.post("/create", authenticateUser, createTicket);
router.delete("/delete/:id", deleteTicket);
router.patch("/edit/:id", updateTicket);
router.get("/all", getAllTickets);
router.get("/find/:id", getTicket);
router.post("/assign/manual/:id", assignWorkerManual);
router.post("/assign/auto/:id", assignWorkerAuto);
router.get("/workers/:id", getAvailableWorkers);

module.exports = router;
