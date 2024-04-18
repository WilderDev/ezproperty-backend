const router = require("express").Router();
const { authenticateUser } = require("../middleware/auth.middleware");

const { createTicket, deleteTicket, updateTicket, getTicket, getAllTickets, assignWorker } = require("../controllers/ticket.controller");

router.post("/create", authenticateUser, createTicket);
router.delete("/delete/:id", authenticateUser, deleteTicket);
router.patch("/edit/:id", authenticateUser, updateTicket);
router.get("/all", authenticateUser, getAllTickets);
router.get("/find/:id", authenticateUser, getTicket);
router.patch("/edit/assign/:id", authenticateUser, assignWorker);

module.exports = router;
