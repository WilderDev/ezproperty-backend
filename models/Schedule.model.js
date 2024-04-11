const { Schema, model } = require("mongoose");

const TimeslotSchema = new Schema(
	{
		ticketId: {
			type: String
		}
	},
	{ _id: false }
);

const ScheduleSchema = new Schema({
	schedule: {
		type: Map,
		of: {
			type: Map,
			of: TimeslotSchema
		}
	}
});

module.exports = model("Schedule", ScheduleSchema);
