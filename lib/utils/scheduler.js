const User = require("../../models/User");
const Ticket = require("../../models/Ticket");
const Schedule = require("../../models/Schedule");

const genAvailableWorkersSchedule = async (ticketId, expectedTimeslots) => {
	const ticket = await Ticket.findOne({ _id: ticketId }); // find ticket by id
	const allWorkers = await User.find({ specialty: ticket.type }); // get all workers with the same specialty as the ticket
	let workerStartTimes = {}; // create object to store worker start times
	const incomingPriority = ticket.priority; // get ticket priority
	let needsReschedule = [];

	if (incomingPriority === "LOW") {
		for (let worker of allWorkers) {
			// loop through workers

			const foundSchedule = await Schedule.findOne({ _id: worker.schedule }); // get worker schedule
			if (!foundSchedule) {
				// if worker does not have a schedule
				continue; // skip iteration and move to next worker
			}
			let startTimes = {}; // create object to store start times for this worker

			for (const [day, timeslots] of Object.entries(foundSchedule)) {
				// loop through days, destructure day and timeslots

				let count = 0; // set count to 0
				let startIndex = null; // set start index to null

				for (let i = 0; i < timeslots.length; i++) {
					// loop through timeslots
					let currentTimeslot = timeslots[i];
					if (currentTimeslot.ticketId === undefined) {
						// if there is a ticketId set to undefined
						if (startIndex === null) {
							// if start index is null
							startIndex = i; // set start index to i
						}
						count++; // increment count
						if (count === expectedTimeslots) {
							// if count is equal to expected timeslots
							startTimes[day] = startTimes[day] || []; // create array for each day if it does not exist inside start times
							startTimes[day].push(timeslots[startIndex]); // push available start time to the array corresponding to the day
						}
					} else {
						count = 0; // reset count
						startIndex = null; // reset start index
					}
				}
			}
			workerStartTimes[worker["_id"]] = startTimes; // set worker start times
		}
		return workerStartTimes; // return worker start times
	} else if (incomingPriority === "MEDIUM") {
		for (let worker of allWorkers) {
			// loop through workers

			const foundSchedule = await Schedule.findOne({ _id: worker.schedule }); // get worker schedule

			if (!foundSchedule) {
				// if worker does not have a schedule
				continue; // skip iteration and move to next worker
			}

			let startTimes = {}; // create object to store start times

			for (const [day, timeslots] of Object.entries(foundSchedule)) {
				// loop through days, destructure day and timeslots

				let count = 0; // set count to 0
				let startIndex = null; // set start index to null

				for (let i = 0; i < timeslots.length; i++) {
					// loop through timeslots
					let currentTimeslot = timeslots[i];
					if (currentTimeslot.ticketId !== undefined) {
						// if there is a ticketId not set to undefined
						const scheduledTicket = await Ticket.findOne({
							_id: currentTimeslot.ticketId
						}); // find ticket by id
						if (!scheduledTicket) {
							// if scheduled ticket does not exist
							currentTimeslot.ticketId = undefined; // set ticket id to undefined
						}
						if (currentTimeslot.ticketId === undefined || scheduledTicket.priority === "LOW") {
							// if there is a ticketId set to undefined or ticket priority is low
							if (scheduledTicket.priority === "LOW") {
								// if ticket priority is low
								needsReschedule.push(scheduledTicket["_id"]); // add ticket to needs reschedule array
								currentTimeslot.ticketId = undefined; // set ticket id to undefined
							}
							if (startIndex === null) {
								// if start index is null
								startIndex = i; // set start index to i
							}
							count++; // increment count
							if (count === expectedTimeslots) {
								// if count is equal to expected timeslots
								startTimes[day] = startTimes[day] || []; // create array for day if it does not exist inside start times
								startTimes[day].push(timeslots[startIndex]); // push available start time to day
							}
						} else {
							count = 0; // reset count
							startIndex = null; // reset start index
						}
					} else {
						// if there is a ticketId set to undefined
						if (startIndex === null) {
							// if start index is null
							startIndex = i; // set start index to i
						}
						count++; // increment count
						if (count === expectedTimeslots) {
							// if count is equal to expected timeslots
							startTimes[day] = startTimes[day] || []; // create array for day if it does not exist inside start times
							startTimes[day].push(timeslots[startIndex]); // push available start time to day
						}
					}
				}
			}
			workerStartTimes[worker["_id"]] = startTimes; // set worker start times
		}
		return workerStartTimes; // return worker start times
	} else if (incomingPriority === "HIGH") {
		for (let worker of allWorkers) {
			// loop through workers
			const foundSchedule = await Schedule.findOne({ _id: worker.schedule }); // get worker schedule
			if (!foundSchedule) {
				// if worker does not have a schedule
				continue; // skip iteration and move to next worker
			}
			let startTimes = {}; // create object to store start times

			for (const [day, timeslots] of Object.entries(foundSchedule)) {
				// loop through days, destructure day and timeslots

				let count = 0; // set count to 0
				let startIndex = null; // set start index to null

				for (let i = 0; i < timeslots.length; i++) {
					// loop through timeslots

					let currentTimeslot = timeslots[i];

					if (currentTimeslot.ticketId !== undefined) {
						// if there is a ticketId not set to undefined

						const scheduledTicket = await Ticket.findOne({
							_id: currentTimeslot.ticketId
						}); // find ticket by id

						if (!scheduledTicket) {
							// if scheduled ticket does not exist
							currentTimeslot.ticketId = undefined; // set ticket id to undefined
						}

						if (scheduledTicket.priority === "LOW" || scheduledTicket.priority === "MEDIUM" || currentTimeslot === null) {
							// if there is a ticketId set to undefined or ticket priority is low or medium or timeslot is null
							if (scheduledTicket.priority === "LOW" || scheduledTicket.priority === "MEDIUM") {
								// if ticket priority is low or medium
								needsReschedule.push(scheduledTicket["_id"]); // add ticket to needs reschedule array
								currentTimeslot.ticketId = undefined; // set ticket id to undefined
							}
							if (currentTimeslot === null) {
								//TODO: Add logic to notify user that worker has been scheduled outside of their shift hours
							}
							if (startIndex === null) {
								// if start index is null
								startIndex = i; // set start index to i
							}
							count++; // increment count
							if (count === expectedTimeslots) {
								// if count is equal to expected timeslots
								startTimes[day] = startTimes[day] || []; // create array for day if it does not exist inside start times
								startTimes[day].push(timeslots[startIndex]); // push available start time to day
							}
						} else {
							count = 0; // reset count
							startIndex = null; // reset start index
						}
					} else {
						// if there is a ticketId set to undefined

						if (startIndex === null) {
							// if start index is null
							startIndex = i; // set start index to i
						}

						count++; // increment count

						if (count === expectedTimeslots) {
							// if count is equal to expected timeslots
							startTimes[day] = startTimes[day] || []; // create array for day if it does not exist inside start times
							startTimes[day].push(timeslots[startIndex]); // push available start time to day
						}
					}
				}
			}
			workerStartTimes[worker["_id"]] = startTimes; // set worker start times
		}
		return { workerStartTimes, needsReschedule }; // return worker start times and and array of tickets that need to be rescheduled
	}
};

module.exports = {
	genAvailableWorkersSchedule
};
