const { genSchedule, extendSchedule, trimSchedule, bookWorker, schedule } = require("../controllers/schedule.controller");
const router = require("express").Router();

router.post("/generate/:userId", genSchedule);
router.patch("/extend/:userId", extendSchedule);
router.patch("/trim/:userId", trimSchedule);
router.get("/auto", schedule);
router.post("/", bookWorker);

module.exports = router;
