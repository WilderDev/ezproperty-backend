const { Schema, model, Types } = require("mongoose");

const TicketSchema = new Schema({
	propertyId: {
		type: Types.ObjectId,
		ref: "Property",
		required: true
	},
	priorityLevel: {
		type: String,
		enum: ["HIGH", "MEDIUM", "LOW"],
		required: true
	},
	image: {
		type: String
	},
	type: {
		type: String,
		enum: ["PLUMBING", "ELECTRICAL", "HVAC", "APPLIANCE", "PEST", "OTHER"],
		required: true
	},
	description: {
		type: String,
		required: true,
		maxLength: 1024
	},
	progress: {
		type: String,
		enum: ["Backlog", "In-Progress", "Blockage", "Completed"],
		required: true
	}
});

module.exports = model("Ticket", TicketSchema);
