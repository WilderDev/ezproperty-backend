const {
	// genSchedule,
	// extendSchedule,
	// trimSchedule,
	bookWorker
} = require("../controllers/schedule.controller");
const router = require("express").Router();

// router.post("/generate/:userId", genSchedule);
// router.patch("/extend/:userId", extendSchedule);
// router.patch("/trim/:userId", trimSchedule);
router.post("/", bookWorker);

module.exports = router;
