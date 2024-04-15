const { genSchedule, extendSchedule, trimSchedule } = require("../controllers/schedule.controller");
const router = require("express").Router();

router.post("/generate/:userId", genSchedule);
router.patch("/extend/:userId", extendSchedule);
router.patch("/trim/:userId", trimSchedule);

module.exports = router;
