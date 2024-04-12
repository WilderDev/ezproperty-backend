const { Schema, model, Types } = require("mongoose");

const PropertySchema = new Schema({
	streetAddress: { type: String, required: true },
	aptNumber: { type: String, required: true },
	city: {
		type: String,
		required: true
	},
	state: { type: String, required: true },
	zipCode: { type: Number, required: true },

	currentTenant: {
		type: Types.ObjectId,
		ref: "User"
	}
});

module.exports = model("Property", PropertySchema);
