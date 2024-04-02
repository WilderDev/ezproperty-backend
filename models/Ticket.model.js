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
	type: {
		type: String,
		enum: ["Plumbing", "Electrical", "Structural", "HVAC", "General", "Pest", "Other"],
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
