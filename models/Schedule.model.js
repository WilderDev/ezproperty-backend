const { Schema, model, Types } = require("mongoose");

const ScheduleSchema = new Schema({
	schedule: {
		type: Map,
		of: {
			type: Map,
			of: {
				type: {
					type: Types.ObjectId,
					ref: "Ticket",
					validate: {
						validator: (v) => v === undefined || Types.ObjectId.isValid(v),
						message: "ticketId must be a valid ObjectId or undefined"
					}
				}
			}
		}
	}
});

const Schedule = model("Schedule", ScheduleSchema);

module.exports = Schedule;
