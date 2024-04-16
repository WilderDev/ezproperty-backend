// * IMPORTS
const { Schema, model, Types } = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validate } = require("./Schedule.model");

// * SCHEMA
const UserSchema = new Schema({
	username: {
		type: String,
		required: [true, "Please provide username"],
		minlength: 4,
		maxlength: 32,
		unique: true
	},
	email: {
		type: String,
		unique: true,
		required: [true, "please use email address"],
		match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
	},
	password: {
		type: String,
		required: [true, "please provide password"],
		minlength: 6
	},
	role: {
		type: String,
		enum: ["MANAGER", "WORKER", "TENANT"],
		required: true
	},
	verificationToken: String,
	isVerified: {
		type: Boolean,
		default: false
	},
	verified: Date,
	passwordToken: {
		type: String
	},
	passwordTokenExpirationDate: {
		type: Date
	},
	firstName: {
		type: String
	},
	middleInitial: {
		type: String,
		maxLength: 1
	},
	lastName: {
		type: String
	},
	phoneNumber: {
		type: String,
		match: [/^(?:\+?1)?(?:\s|-)?\(?\d{3}\)?(?:\s|-)?\d{3}(?:\s|-)?\d{4}$/, "please use a valid phone number"]
	},
	propertyId: {
		type: Types.ObjectId,
		ref: "Property"
	},
	workSpecialization: [
		{
			type: String,
			enum: ["Plumbing", "Electrical", "Structural", "HVAC", "General", "Pest", "Other"]
		}
	],
	workSchedule: {
		type: Types.ObjectId,
		ref: "Schedule"
	},
	isBooked: {
		type: Boolean,
		default: false
	},
	bookedTicket: {
		type: Types.ObjectId,
		ref: "Ticket"
	},
	startShift: {
		type: String,
		default: "08:00"
	},
	endShift: {
		type: String,
		default: "17:00"
	},
	managedWorkers: {
		type: [{ type: Types.ObjectId, ref: "User" }]
	},
	managedTenants: {
		type: [{ type: Types.ObjectId, ref: "User" }]
	},
	managedProperties: {
		type: [{ type: Types.ObjectId, ref: "Property" }]
	},
	manager: {
		type: Types.ObjectId,
		ref: "User"
	}
});

// * MIDDLEWARE
// Hash password before saving
UserSchema.pre("save", async function () {
	if (!this.isModified("password")) return; // If the password hasn't been modified, move on to the next middleware

	const salt = await bcrypt.genSalt(10); // Generate a salt

	this.password = await bcrypt.hash(this.password, salt); // Hash the password
});

// * METHODS
// Compare password with hashed password
UserSchema.methods.comparePass = async function (candidatePassword) {
	const isMatch = await bcrypt.compare(candidatePassword, this.password); // Compare the candidate password with the hashed password

	return isMatch; // Return the result
};

// Generate token
UserSchema.methods.generateToken = function () {
	// Generate a token
	const token = jwt.sign(
		{
			id: this._id,
			username: this.username
		},
		process.env.JWT_SECRET,
		{ expiresIn: process.env.JWT_LIFETIME }
	);

	return token; // Return the token
};

// * MODEL
const User = model("User", UserSchema);

// * EXPORTS
module.exports = User;
