const { Schema, model } = require("mongoose");

const ScheduleSchema = new Schema({
	schedule: {
		type: Schema.Types.Mixed,
		default: () => ({})
	}
});

const Schedule = model("Schedule", ScheduleSchema);

module.exports = Schedule;
