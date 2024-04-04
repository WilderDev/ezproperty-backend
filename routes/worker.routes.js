//* IMPORTS
const router = require("express").Router();
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
router.post("/new-user", createUserAsWorker);
router.post("/make-worker/:userId", grantWorker);
router.delete("/remove-worker/:userId", revokeWorker);
router.get("/get-worker/:userId", getWorkerById);
router.get("/get-all-workers", getAllWorkers);
router.get("/get-worker-by-type", getWorkerByType);
router.get("/get-worker-by-hours", getWorkerByHours);
router.patch("/change-shift/:userId", changeShift);
router.patch("/add-specialization/:userId", addSpecialization);
router.patch("/remove-specialization/:userId", removeSpecialization);

//* EXPORTS
module.exports = router;
