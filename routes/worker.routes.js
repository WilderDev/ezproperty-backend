//* IMPORTS
const router = require("express").Router();
const { authenticateUser } = require("../middleware/auth.middleware");

const {
	createUserAsWorker,
	grantWorker,
	revokeWorker,
	getWorkerById,
	getAllWorkers,
	getWorkerByType,
	getWorkerByHours,
	changeShift,
	addSpecialization,
	removeSpecialization
} = require("../controllers/worker.controller");

//* ROUTES
router.post("/new-user", authenticateUser, createUserAsWorker);
router.post("/make-worker/:userId", authenticateUser, grantWorker);
router.delete("/remove-worker/:userId", authenticateUser, revokeWorker);
router.get("/get-worker/:userId", authenticateUser, getWorkerById);
router.get("/get-all-workers", authenticateUser, getAllWorkers);
router.get("/get-worker-by-type", authenticateUser, getWorkerByType);
router.get("/get-worker-by-hours", authenticateUser, getWorkerByHours);
router.patch("/change-shift/:userId", authenticateUser, changeShift);
router.patch("/add-specialization/:userId", authenticateUser, addSpecialization);
router.patch("/remove-specialization/:userId", authenticateUser, removeSpecialization);

//* EXPORTS
module.exports = router;
