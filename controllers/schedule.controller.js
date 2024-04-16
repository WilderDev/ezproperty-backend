const User = require("../models/User.model");
// const Schedule = require("../models/Schedule.model");
const Ticket = require("../models/Ticket.model");
const { good, bad } = require("../lib/utils/res");

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
	//TODO foundUser.isBooked = true; // set the user as booked
	foundUser.bookedTicket = ticketId; // set the booked ticket
	foundTicket.assignedWorker = foundUser._id; // set the assigned worker
	await foundTicket.save(); // save the ticket
	await foundUser.save(); // save the user
	return good({ res, data: foundUser }); // return the user
};

/*

const genSchedule = async function (req, res) {
	const { userId } = req.params; // get the user id from the request parameters
	const { unixtimestamp } = req.body; // get the unix timestamp from the request body
	const foundUser = await User.findById(userId); // find the user using the user id
	if (!foundUser) return bad({ res, status: 404, message: "User not found" }); // if the user is not found, return an error
	console.log("Generating schedule for", foundUser.username);

	const workScheduleId = await foundUser.populate({ path: "workSchedule", select: "_id" }); // get the work schedule id
	const foundSchedule = await Schedule.findById(workScheduleId); // find the schedule using the work schedule id

	//TODO

	//if the user has an existing scheduleId on the user model
	console.log("Deleting existing schedule under user...");
	if (foundSchedule) {
		//and if the schedule exists in the database
		console.log("Deleted existing schedule in database...");
		await foundSchedule.deleteOne();
	} else {
		console.log("Existing schedule not found in database..."); //but the schedule does not exist in the database
	}
	foundUser.workSchedule = undefined; //delete the scheduleId from the user model
	await foundUser.save(); //save the user model

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
		console.log("Generating schedule for", date.toISOString().split("T")[0]);

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
	const createdSchedule = await new Schedule(schedule); // create the schedule
	await User.updateOne(
		{ _id: foundUser._id }, // update the user
		{ workSchedule: createdSchedule._id } // with the new schedule
	);
	return createdSchedule; // return the schedule
};

const extendSchedule = async function (req, res) {
	const { userId } = req.params; // get the user id from the request parameters
	const foundUser = await User.findById(userId); // find the user using the user id

	const scheduleId = await foundUser.workSchedule;
	const foundSchedule = await Schedule.findById(scheduleId);

	if (foundUser.role !== "WORKER") return null; // if the user is not a staff member, return null
	let schedule = await Schedule.findOne({ _id: foundUser.workSchedule }); // find the schedule using the user's schedule id

	let startShiftMinutes = parseInt(foundUser.startShift.split(":")[1]); // get the start shift minutes
	let startShiftHours = parseInt(foundUser.startShift.split(":")[0]); // get the start shift hours
	let endShiftMinutes = parseInt(foundUser.endShift.split(":")[1]); // get the end shift minutes
	let endShiftHours = parseInt(foundUser.endShift.split(":")[0]); // get the end shift hours

	if (!schedule) return null; // if the schedule is not found, return null
	if (!schedule["schedule"]) {
		console.log("Schedule not found for", foundUser.username);
		await Schedule.deleteOne({ _id: foundUser.workSchedule }); // delete the schedule
		foundUser.workSchedule = undefined; // set the work schedule to undefined
		foundUser.genSchedule(Date.now()); // generate a new schedule
		return;
	} else {
		console.log("Extending schedule for", foundUser.username);
	}

	let lastDay = Object.keys(schedule).sort().pop(); // get the last day in the schedule
	let lastDayDate = new Date(lastDay); // get the last day in date format
	let forecastLength = parseInt(process.env.FORECAST_LENGTH, 10); // get the forecast length

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
const trimSchedule = async function () {
	const { userId } = req.params; // get the user id from the request parameters
	const foundUser = await User.findById(userId); // find the user using the user id

	const scheduleId = await foundUser.workSchedule;
	const foundSchedule = await Schedule.findById(scheduleId);

	if (foundUser.role !== "WORKER") return null; // if the user is not a staff member, return null
	let schedule = await Schedule.findOne({ _id: foundUser.workSchedule }); // find the schedule using the user's schedule id
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

*/

module.exports = {
	bookWorker
	// genSchedule,
	// extendSchedule,
	// trimSchedule
};
