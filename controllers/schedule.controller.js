const User = require("../models/User.model");
const Schedule = require("../models/Schedule.model");
const Ticket = require("../models/Ticket.model");
const { convertMapofMaps } = require("../lib/utils/mapToObject");
const { good, bad } = require("../lib/utils/res");
const { autoSchedule } = require("../lib/utils/scheduler");

const bookWorker = async function (req, res) {
	const { ticketId } = req.body; // get the user id from the request body
	const foundTicket = await Ticket.findById(ticketId); // find the ticket using the ticket id
	const { type } = foundTicket; // get the type of work from the ticket
	let allWorkers = await User.find({ role: "WORKER", isBooked: false }); // find the user using the type of work
	let specialists = allWorkers.filter((user) => user.workSpecialization.includes(type)); // filter the users by the type of work
	if (specialists.length === 0) return bad({ res, status: 404, message: `User not found with specialty ${type}` }); // if the user is not found, return an error
	let foundUser = specialists[Math.floor(Math.random() * (specialists.length - 1))]; // find a random user
	if (!foundUser) return bad({ res, status: 404, message: `User not found with specialty ${type}` }); // if the user is not found, return an error
	if (!foundTicket) return bad({ res, status: 404, message: "Ticket not found" }); // if the ticket is not found, return an error
	//!!! foundUser.isBooked = true; // set the user as booked
	foundUser.bookedTicket = ticketId; // set the booked ticket
	foundTicket.assignedWorker = foundUser._id; // set the assigned worker
	await foundTicket.save(); // save the ticket
	await foundUser.save(); // save the user
	return good({ res, data: foundUser }); // return the user
};

const genSchedule = async function (req, res) {
	const { userId } = req.params; // get the user id from the request parameters
	const { unixtimestamp } = req.body; // get the unix timestamp from the request body
	const foundUser = await User.findById(userId); // find the user using the user id
	if (!foundUser) return bad({ res, status: 404, message: "User not found" }); // if the user is not found, return an error
	if (foundUser.role !== "WORKER") return null; // if the user is not a staff member, return null
	let date = new Date(unixtimestamp); // get the date

	date.setUTCHours(0, 0, 0, 0); // set the date to midnight
	let dayMillis = 1000 * 60 * 60 * 24; // 24 hours in milliseconds

	const schedule = {}; // create a new object for the schedule
	const forecastLength = parseInt(process.env.FORECAST_LENGTH, 10); // get the forecast length

	let startShiftMinutes = parseInt(foundUser.startShift.split(":")[1]); // get the start shift minutes
	let startShiftHours = parseInt(foundUser.startShift.split(":")[0]); // get the start shift hours
	let endShiftMinutes = parseInt(foundUser.endShift.split(":")[1]); // get the end shift minutes
	let endShiftHours = parseInt(foundUser.endShift.split(":")[0]); // get the end shift hours);

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
	if (foundUser.workSchedule) {
		//if the user has an existing scheduleId on the user model
		const foundSchedule = await Schedule.findById(foundUser.workSchedule); //find the schedule in the database
		if (foundSchedule) {
			//if the schedule exists in the database
			await foundSchedule.deleteOne(); //delete the schedule from the database
		}
		foundUser.workSchedule = undefined; //delete the scheduleId from the user model
	}

	const createdSchedule = await Schedule.create({ schedule }); // create the schedule
	foundUser.workSchedule = createdSchedule._id; // set the work schedule
	await foundUser.save(); // save the user
	good({ res, data: createdSchedule }); // return the schedule
};

const extendSchedule = async function (req, res) {
	const { userId } = req.params; // get the user id from the request parameters

	const foundUser = await User.findById(userId); // find the user using the user id

	const scheduleId = await foundUser.workSchedule; // get the schedule id from the user model
	let foundSchedule = await Schedule.findById(scheduleId); // find the schedule using the user's schedule id

	if (foundUser.role !== "WORKER") {
		bad({ res, status: 404, message: "User not found" }); // if the user is not a staff member, return an error
	}

	let startShiftMinutes = parseInt(foundUser.startShift.split(":")[1]); // get the start shift minutes
	let startShiftHours = parseInt(foundUser.startShift.split(":")[0]); // get the start shift hours
	let endShiftMinutes = parseInt(foundUser.endShift.split(":")[1]); // get the end shift minutes
	let endShiftHours = parseInt(foundUser.endShift.split(":")[0]); // get the end shift hours

	if (!foundSchedule) {
		bad({ res, status: 404, message: "Schedule not found" }); // if the schedule is not found, return an error
	}

	const convertedSchedule = convertMapofMaps(foundSchedule["schedule"]); // convert the schedule (map of maps) to an object
	for (let day in convertedSchedule) {
		// for each day in the schedule
		for (let [time, timeslot] of Object.entries(convertedSchedule[day])) {
			// for each time in the schedule
			if (timeslot !== null && timeslot.ticketId !== (undefined || null)) {
				// if there is a ticket scheduled
				timeslot.ticketId = timeslot.ticketId.toHexString(); // convert the ticket id to a string
			}
		}
	}
	let forecastLength = parseInt(process.env.FORECAST_LENGTH, 10); // get the forecast length
	let today = new Date(Date.now()); // get today's date
	today.setUTCHours(0, 0, 0, 0); // set the time to midnight

	for (let count = 1; count <= forecastLength; count++) {
		let nextDayTimestamp = today.getTime() + count * 1000 * 60 * 60 * 24; // get the next day in milliseconds
		let nextDayISO = new Date(nextDayTimestamp).toISOString().split("T")[0]; // get the next day in ISO format
		if (!convertedSchedule[nextDayISO]) {
			// if the next day is not in the schedule
			convertedSchedule[nextDayISO] = {}; // create a new object for the day
			for (let hour = 0; hour < 24; hour++) {
				// for each hour in the day
				for (let minute = 0; minute < 60; minute += 30) {
					// for each half hour in the hour
					const timeslot = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`; // create the timeslot
					const timeslotValue =
						hour < startShiftHours || // if the hour is before the start shift
						hour >= endShiftHours || // or after the end shift
						(hour === startShiftHours && // or if the hour is the same as the start shift
							minute < startShiftMinutes) || // and the minute is before the start shift
						(hour === endShiftHours && // or if the hour is the same as the end shift
							minute >= endShiftMinutes) // and the minute is after the end shift
							? null // set to null
							: { ticketId: undefined }; // otherwise, mark as undefined
					convertedSchedule[nextDayISO][timeslot] = timeslotValue; // fill in the timeslot
				}
			}
		}
	}
	await Schedule.findByIdAndUpdate({ _id: scheduleId }, { schedule: convertedSchedule }, { new: true, runValidators: true }); // save the schedule
	good({ res, data: convertedSchedule }); // return the schedule
};

const trimSchedule = async function (req, res) {
	const { userId } = req.params; // get the user id from the request parameters
	const foundUser = await User.findById(userId); // find the user using the user id

	const scheduleId = await foundUser.workSchedule; // get the schedule id from the user model
	const foundSchedule = await Schedule.findById(scheduleId); // find the schedule using the user's schedule id

	if (foundUser.role !== "WORKER") return null; // if the user is not a staff member, return null
	if (!foundSchedule) return null; // if the schedule is not found, return null

	const convertedSchedule = convertMapofMaps(foundSchedule["schedule"]); // convert the schedule (map of maps) to an object
	for (let day in convertedSchedule) {
		// for each day in the schedule
		for (let [time, timeslot] of Object.entries(convertedSchedule[day])) {
			// for each time in the schedule
			if (timeslot !== null && timeslot.ticketId !== (undefined || null)) {
				// if there is a ticket scheduled
				timeslot.ticketId = timeslot.ticketId.toHexString(); // convert the ticket id to a string
			}
		}
	}
	let today = new Date(Date.now()); // get today's date
	today.setUTCHours(0, 0, 0, 0); // set the time to midnight
	let forecastLength = parseInt(process.env.FORECAST_LENGTH, 10); // get the forecast length

	const scheduleWindow = new Set(); // create a new set
	for (let count = 0; count < forecastLength; count++) {
		// for each day in the forecast
		let nextDayTimestamp = today.getTime() + count * 1000 * 60 * 60 * 24; // get the next day in milliseconds
		let nextDayISO = new Date(nextDayTimestamp).toISOString().split("T")[0]; // get the next day in ISO format
		scheduleWindow.add(nextDayISO); // add the day to the schedule window
	}
	Object.keys(convertedSchedule).forEach((day) => {
		// get the keys of the schedule
		// for each day in the schedule
		if (!scheduleWindow.has(day)) {
			// if the day is not in the schedule window
			delete convertedSchedule[day]; // delete the day from the schedule
		}
	});
	await Schedule.findByIdAndUpdate({ _id: scheduleId }, { schedule: convertedSchedule }, { new: true, runValidators: true }); // save the schedule
	good({ res, data: convertedSchedule }); // return the schedule
};

const schedule = async (req, res) => {
	const { ticketId } = req.body; // get ticket id and expected job length from request body
	const response = await autoSchedule(ticketId);
	good({ res, data: response }); // return the response
};

module.exports = {
	bookWorker,
	genSchedule,
	extendSchedule,
	trimSchedule,
	schedule
};
