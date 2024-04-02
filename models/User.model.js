// * IMPORTS
const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// * SCHEMA
const UserSchema = new Schema({
	username: {
		type: String,
		required: true,
		minlength: 4,
		maxlength: 32,
		unique: true
	},
	email: {
		type: String,
		required: true,
		match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "please use a valid email address"],
		unique: true
	},
	password: {
		type: String,
		required: [true, "please provide a password"],
		minlength: 6
	},
	role: {
		type: String,
		enum: ["MANAGER", "STAFF", "TENANT"],
		default: "TENANT"
	},
	verificationToken: String,
	isVerified: {
		type: Boolean,
		default: false
	},
	isWorker: {

	},
	isTenant: {

	},
	verified: Date,
	passwordToken: {
		type: String
	},
	passwordTokenExpirationDate: {
		type: Date
	},
	firstName: {
		type: String,
		required: true
	},
	middleInitial: {
		type: String,
		required: true,
		maxLength: 1
	},
	lastName: {
		type: String,
		required: true
	},
	phoneNumber: {
		type: String,
		match: [
			/^(?:\+?1)?(?:\s|-)?\(?\d{3}\)?(?:\s|-)?\d{3}(?:\s|-)?\d{4}$/,
			"please use a valid phone number"
		],
		required: true
	},
	emergencyContact: {
		type: {
			firstName: { type: String, required: true },
			lastName: { type: String, required: true },
			relationship: { type: String, required: true },
			phoneNumber: { type: String, required: true }
		}
	},
	workSpecialization: {
		type: String,
		enum: [""],
	},
	workSchedule: {
		{
			1: [],
			2: [],
			3: [],
			4: [],
			5: [],
			6: [],
			7: []
		}
	}

});


const now = new Date(Date.now())
const today = now.setUTCHours(0,0,0,0)
function generateNextDay(date) {
	const day = 1000 * 60 * 60 * 24;
	const tomorrow = new Date(date + day)
	console.log(date)
	console.log(tomorrow.getTime());
	return tomorrow;
}

function generateNext7Days(date) {
	
	
	
	
}










// * MIDDLEWARE
// Hash password before saving
UserSchema.pre("save", async function () {
	if (!this.isModified("password")) return; // If the password hasn't been modified, move on to the next middleware

	const salt = await bcrypt.genSalt(10); // Generate a salt

	this.password = await bcrypt.hash(this.password, salt); // Hash the password
});

// * METHODS
// Compare password with hashed password
UserSchema.methods.comparePass = async function (candidatePass) {
	const isMatch = await bcrypt.compare(candidatePass, this.password); // Compare the candidate password with the hashed password

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
