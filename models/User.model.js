// * IMPORTS
const { Schema, model, Types } = require("mongoose");
const Schedule = require("./Schedule.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
		match: [
			/^(?:\+?1)?(?:\s|-)?\(?\d{3}\)?(?:\s|-)?\d{3}(?:\s|-)?\d{4}$/,
			"please use a valid phone number"
		]
	},
	propertyId: {
		type: Types.ObjectId,
		ref: "Property"
	},
	workSpecialization: [
		{
			type: String,
			enum: ["HVAC", "ELECTRICAL", "PLUMBING", "STRUCTURAL", "GENERAL"]
		}
	],
	workSchedule: {
		type: Types.ObjectId,
		ref: "Schedule"
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
		type: [Types.ObjectId],
		ref: "User"
	},
	managedTenants: {
		type: [Types.ObjectId],
		ref: "User"
	},
	managedProperties: {
		type: [Types.ObjectId],
		ref: "Property"
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

// function to generate a schedule
UserSchema.methods.genSchedule = async function (unixtimestamp) {
	if (this.role !== "WORKER") return null; // if the user is not a staff member, return null
	let date = new Date(unixtimestamp); // get the date
	date.setUTCHours(0, 0, 0, 0); // set the date to midnight
	let dayMillis = 1000 * 60 * 60 * 24; // 24 hours in milliseconds
	const schedule = {}; // create a new object for the schedule
	const forecastLength = parseInt(process.env.FORECAST_LENGTH, 10); // get the forecast length

	let startShiftMinutes = parseInt(this.startShift.split(":")[1]); // get the start shift minutes
	let startShiftHours = parseInt(this.startShift.split(":")[0]); // get the start shift hours
	let endShiftMinutes = parseInt(this.endShift.split(":")[1]); // get the end shift minutes
	let endShiftHours = parseInt(this.endShift.split(":")[0]); // get the end shift hours

	for (let count = 0; count < forecastLength; count++) {
		// for each day in the forecast
		let nextDayTimestamp = date.getTime() + count * dayMillis; // get the next day in milliseconds
		let nextDayISO = new Date(nextDayTimestamp).toISOString().split("T")[0]; // get the next day in ISO format
		schedule[nextDayISO] = {}; // create a new object for each day

		for (let hour = 0; hour < 24; hour++) {
			// for each hour in the day
			for (let minute = 0; minute < 60; minute += 30) {
				// for each half hour in the hour
				const timeslot = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`; // create the timeslot
				const timeslotValue = // create the timeslot value
					// turnary operator to check if the timeslot is before the start shift
					// convert the timeslot to minutes and compare to the start shift
					hour < startShiftHours || // if the hour is before the start shift
					hour >= endShiftHours || // or after the end shift
					(hour === startShiftHours && // or if the hour is the same as the start shift
						minute < startShiftMinutes) || // and the minute is before the start shift
					(hour === endShiftHours && // or if the hour is the same as the end shift
						minute >= endShiftMinutes) // and the minute is after the end shift
						? null // set to null
						: { ticketId: undefined }; // otherwise, mark as undefined
				schedule[nextDayISO][timeslot] = timeslotValue; // fill in the timeslot
			}
		}
	}
	const createdSchedule = await Schedule.create(schedule); // create the schedule
	await User.updateOne(
		{ _id: this._id }, // update the user
		{ workSchedule: createdSchedule._id } // with the new schedule
	);
};

// function to extend the schedule
UserSchema.methods.extendSchedule = async function () {
	if (this.role !== "WORKER") return null; // if the user is not a staff member, return null
	let schedule = await Schedule.findOne({ _id: this.workSchedule }); // find the schedule using the user's schedule id
	if (!schedule) return null; // if the schedule is not found, return null

	let lastDay = Object.keys(schedule).sort().pop(); // get the last day in the schedule
	let lastDayDate = new Date(lastDay); // get the last day in date format
	let forecastLength = parseInt(process.env.FORECAST_LENGTH, 10); // get the forecast length

	let startShiftMinutes = parseInt(this.startShift.split(":")[1]); // get the start shift minutes
	let startShiftHours = parseInt(this.startShift.split(":")[0]); // get the start shift hours
	let endShiftMinutes = parseInt(this.endShift.split(":")[1]); // get the end shift minutes
	let endShiftHours = parseInt(this.endShift.split(":")[0]); // get the end shift hours

	for (let count = 1; count <= forecastLength; count++) {
		let nextDayTimestamp = lastDayDate.getTime() + count * 1000 * 60 * 60 * 24; // get the next day in milliseconds
		let nextDayISO = new Date(nextDayTimestamp).toISOString().split("T")[0]; // get the next day in ISO format

		if (!schedule[nextDayISO]) {
			// if the next day is not in the schedule
			schedule[nextDayISO] = {}; // create a new object for the day
			for (let hour = 0; hour < 24; hour++) {
				// for each hour in the day
				for (let minute = 0; minute < 60; minute += 30) {
					// for each half hour in the hour
					const timeslot = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`; // create the timeslot
					// turnary operator to check if the timeslot is before the start shift
					// convert the timeslot to minutes and compare to the start shift
					const timeslotValue = // create the timeslot value
						hour < startShiftHours || // if the hour is before the start shift
						hour >= endShiftHours || // or after the end shift
						(hour === startShiftHours && // or if the hour is the same as the start shift
							minute < startShiftMinutes) || // and the minute is before the start shift
						(hour === endShiftHours && // or if the hour is the same as the end shift
							minute >= endShiftMinutes) // and the minute is after the end shift
							? null // set to null
							: { ticketId: undefined }; // otherwise, mark as undefined
					schedule[nextDayISO][timeslot] = timeslotValue; // fill in the timeslot
				}
			}
		}
	}
	await schedule.save(); // save the schedule
	return schedule; // return the schedule
};

// function to trim the schedule
UserSchema.methods.trimSchedule = async function () {
	if (this.role !== "WORKER") return null; // if the user is not a staff member, return null
	let schedule = await Schedule.findOne({ _id: this.workSchedule }); // find the schedule using the user's schedule id
	if (!schedule) return null; // if the schedule is not found, return null

	let today = new Date(); // get today's date
	today.setUTCHours(0, 0, 0, 0); // set the time to midnight
	let forecastLength = parseInt(process.env.FORECAST_LENGTH, 10); // get the forecast length

	const scheduleWindow = new Set(); // create a new set
	for (let count = 0; count < forecastLength; count++) {
		// for each day in the forecast
		let nextDayTimestamp = today.getTime() + count * 1000 * 60 * 60 * 24; // get the next day in milliseconds
		let nextDayISO = new Date(nextDayTimestamp).toISOString().split("T")[0]; // get the next day in ISO format
		scheduleWindow.add(nextDayISO); // add the day to the schedule window
	}
	Object.keys(schedule.toJSON()).forEach((day) => {
		// get the keys of the schedule
		// for each day in the schedule
		if (!scheduleWindow.has(day)) {
			// if the day is not in the schedule window
			delete schedule[day]; // delete the day from the schedule
		}
	});
	await schedule.save(); // save the schedule
	return schedule; // return the schedule
};

// * MODEL
const User = model("User", UserSchema);

// * EXPORTS
module.exports = User;
