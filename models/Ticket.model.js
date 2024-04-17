const { Schema, model, Types } = require("mongoose");

const TicketSchema = new Schema({
	propertyId: {
		type: Types.ObjectId,
		ref: "Property"
		// required: true
	},
	solution: {
		type: String
	},
	priorityLevel: {
		type: String,
		enum: ["HIGH", "MEDIUM", "LOW"],
		required: true,
		default: "MEDIUM"
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
		default: "Backlog",
		required: true
	},
	assignedWorker: {
		type: Types.ObjectId,
		ref: "User",
		default: "None Assigned"
	},
	manager: {
		type: Types.ObjectId,
		ref: "User",
		required: true
	},
	tenantId: {
		type: Types.ObjectId,
		ref: "User",
		required: true
	},
	predictedTimeslots: {
		type: Number,
		required: true
	}
});

const Ticket = model("Ticket", TicketSchema);

module.exports = Ticket;
