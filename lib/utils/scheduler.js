const User = require("../../models/User.model");
const Ticket = require("../../models/Ticket.model");
const Schedule = require("../../models/Schedule.model");
const { convertMapofMaps } = require("./mapToObject");

async function getAvailWorkerTimes(priorityLevel, predictedTimeslots, filteredWorkers) {
	const workerStartTimes = {}; // create object to store worker start times
	for (let worker of filteredWorkers) {
		// loop through workers
		if (!worker.workSchedule) continue; // if worker does not have a schedule, skip iteration and move to next worker
		const foundSchedule = await Schedule.findById({ _id: worker.workSchedule }); // get worker schedule
		if (!foundSchedule) continue; // if worker schedule does not exist in the database, skip iteration and move to next worker
		let freeTimeBlocks = {}; // create object to store start times for this worker
		let convertedSchedule = convertMapofMaps(foundSchedule["schedule"]); // convert the schedule (map of maps) to an object
		//??? convertedSchedule = convertTicketIdObjectsToHexString(convertedSchedule); // convert ticket ids to strings
		for (const [day, timeslots] of Object.entries(convertedSchedule)) {
			// loop through days, destructure day and timeslots
			const timeslotsArray = Object.entries(timeslots); // convert timeslots to an array
			let count = 0; // set count to 0
			let startIndex = null; // set start index to null

			for (let i = 0; i < timeslotsArray.length; i++) {
				// loop through timeslots
				let currentTimeslotValue = timeslotsArray[i][1];
				if (priorityLevel === "HIGH") {
					if (currentTimeslotValue === null) {
						if (startIndex === null) {
							// if start index is null
							startIndex = i; // set start index to i
						}
						count++; // increment count
						if (count === predictedTimeslots) {
							// if count is equal to expected timeslots
							freeTimeBlocks[day] = freeTimeBlocks[day] || []; // create array for each day if it does not exist inside start times
							freeTimeBlocks[day].push(timeslotsArray[startIndex][0]); // push available start time to the array corresponding to the day
							startIndex = null; // reset start index
							count = 0; // reset count
							i -= predictedTimeslots - 1; // move i back to the start of the available time block
						}
					}
				} else {
					if (currentTimeslotValue === null) {
						continue;
					}
				}
				if (currentTimeslotValue !== null) {
					// if there is a timeslot not set to null
					if (currentTimeslotValue.ticketId !== undefined) {
						// if there is a ticketId not set to undefined in the timeslot
						const scheduledTicket = await Ticket.findOne({
							_id: currentTimeslotValue.ticketId
						}); // find ticket by id
						if (!scheduledTicket) {
							// if scheduled ticket does not exist
							currentTimeslotValue.ticketId = undefined; // set ticket id to undefined
						}
						if (priorityLevel === "MEDIUM") {
							if (scheduledTicket && scheduledTicket.priorityLevel && scheduledTicket.priorityLevel === "LOW") {
								// if there exist a ticket and the ticket priority is low
								currentTimeslotValue.ticketId = undefined; // set ticket id to undefined
							}
						} else if (priorityLevel === "HIGH") {
							if (scheduledTicket && scheduledTicket.priorityLevel && scheduledTicket.priorityLevel === ("LOW" || "MEDIUM")) {
								// if ticket priority is low or medium
								currentTimeslotValue.ticketId = undefined; // set ticket id to undefined
							}
						}
					}

					if (currentTimeslotValue.ticketId === undefined) {
						// if there is a ticketId set to undefined
						if (startIndex === null) {
							// if start index is null
							startIndex = i; // set start index to i
						}
						count++; // increment count
						if (count === predictedTimeslots) {
							// if count is equal to expected timeslots
							freeTimeBlocks[day] = freeTimeBlocks[day] || []; // create array for each day if it does not exist inside start times
							freeTimeBlocks[day].push(timeslotsArray[startIndex][0]); // push available start time to the array corresponding to the day
							startIndex = null; // reset start index
							count = 0; // reset count
							i -= predictedTimeslots - 1; // move i back to the start of the available time block
						}
					} else {
						count = 0; // reset count
						startIndex = null; // reset start index
					}
				}
			}
		}
		workerStartTimes[worker["_id"]] = freeTimeBlocks; // set worker start times
	}
	return workerStartTimes;
}

//TODO: Investigate: code below might not be necessary anymore
function convertTicketIdObjectsToHexString(schedule) {
	for (let day in schedule) {
		for (let timeslot of Object.values(schedule[day])) {
			// for each time in the schedule
			if (timeslot !== null && (timeslot.ticketId !== undefined || timeslot.ticketId !== null)) {
				// if there is a ticket scheduled
				//??? timeslot.ticketId = timeslot.ticketId.toHexString(); // convert the ticket id to a string
			}
		}
	}
	return schedule;
}
//TODO END

async function collectBumpedJobs(schedule, chosenTime, chosenDay, expectedJobLength) {
	const bumpedJobs = [];
	for (let day of Object.keys(schedule)) {
		let count = 0;
		let start = false;
		for (let [time, timeslot] of Object.entries(schedule[day])) {
			if (time === chosenTime) {
				start = true;
			}
			if (count < expectedJobLength && start === true && chosenDay === day) {
				for (let i = 0; i < expectedJobLength; i++) {
					if (timeslot !== null) {
						if (timeslot.ticketId === null) continue;
						const scheduledTicket = await Ticket.findById(timeslot.ticketId);
						if (scheduledTicket.priorityLevel === "LOW") {
							if (!bumpedJobs.includes(scheduledTicket._id.toHexString())) {
								bumpedJobs.push(scheduledTicket._id.toHexString());
							}
						}
					}
				}
				count++;
				if (count === expectedJobLength) start = false;
			}
		}
	}
	return bumpedJobs;
}

async function findLeastWorkedWoker(specialists) {
	let leastWorkedWorker; // variable to store the worker with the least amount of jobs
	let leastWorkedWorkerTimeslotCount; // variable to store the number of jobs the least worked worker has
	for (let worker of specialists) {
		// loop through workers
		let workerJobCount = 0; // variable to store the number of jobs the worker has
		let workerSchedule = await Schedule.findById(worker.workSchedule); // get worker schedule
		let workerScheduleConverted = convertMapofMaps(workerSchedule.schedule); // convert worker schedule to object
		//TODO: Investigate: code below might not be necessary anymore
		for (let day in workerScheduleConverted) {
			// for each day in the schedule
			for (let [time, timeslot] of Object.entries(workerScheduleConverted[day])) {
				// for each time in the schedule
				if (timeslot !== null && (timeslot.ticketId !== undefined || timeslot.ticketId !== null)) {
					// if there is a ticket scheduled
					//??? timeslot.ticketId = timeslot.ticketId.toHexString(); // convert the ticket id to a string
				}
			}
		}
		//TODO END
		for (let day of Object.keys(workerScheduleConverted)) {
			// loop through days
			for (let timeslot of Object.values(workerScheduleConverted[day])) {
				// loop through timeslots
				if (!timeslot === null) {
					if (timeslot.ticketId !== undefined) {
						// if there is a ticket scheduled
						workerJobCount++; // increment job count
					}
				}
			}
		}
		if (!leastWorkedWorker) {
			// if leastWorkedWorker is undefined
			leastWorkedWorker = worker._id.toHexString(); // set leastWorkedWorker to worker id
			leastWorkedWorkerTimeslotCount = workerJobCount; // set leastWorkedWorkerTimeslotCount to workerJobCount
		} else {
			if (workerJobCount < leastWorkedWorkerTimeslotCount) {
				// if worker has less jobs than leastWorkedWorker
				leastWorkedWorker = worker._id.toHexString(); // set leastWorkedWorker to worker id
				leastWorkedWorkerTimeslotCount = workerJobCount; // set leastWorkedWorkerTimeslotCount to workerJobCount
			}
		}
	}
	return leastWorkedWorker;
}

async function autoSchedule(ticketId) {
	//TODO BUG: if job is already scheduled when attempting to schedule another time, it will treat the job as if it is not scheduled
	let responseData = {}; // create object to store response
	let n = null;
	await (async function schedule(ticketId) {
		if (n === null) n = 1;
		else n++;
		const ticket = await Ticket.findOne({ _id: ticketId }); // find ticket by id
		responseData[`ticket${n}`] = {}; // set ticket id in response data
		responseData[`ticket${n}`]["ticketId"] = ticketId; // set ticket in response data
		console.log(responseData);
		const { priorityLevel, type, predictedTimeslots } = ticket; // get ticket priority level and type of work from the ticket
		const allWorkers = await User.find({ role: "WORKER" }); // find all workers
		const filteredWorkers = allWorkers.filter((worker) => worker.workSpecialization.includes(type)); // filter workers by type of work
		if (filteredWorkers.length === 0) return { status: 404, message: `No workers found with specialization ${type}` }; // if no workers are found, return an error
		const workerStartTimes = await getAvailWorkerTimes(priorityLevel, predictedTimeslots, filteredWorkers); // get the available worker times
		const leastWorkedWorker = await findLeastWorkedWoker(filteredWorkers); // find the least worked worker
		responseData[`ticket${n}`]["worker"] = leastWorkedWorker; // set worker in response data
		console.log(responseData);
		const chosenWorkerAvailTimes = workerStartTimes[leastWorkedWorker]; // get the worker id of the chosen worker
		const chosenDay = Object.entries(workerStartTimes[leastWorkedWorker])[0][0]; // get the day of the chosen time block
		responseData[`ticket${n}`]["scheduleDate"] = chosenDay; // set day in response data
		console.log(responseData);
		const chosenTime = Object.entries(workerStartTimes[leastWorkedWorker])[0][1][0]; // get the first available time for the least worked worker
		responseData[`ticket${n}`]["scheduleTime"] = chosenTime; // set time in response data
		console.log(responseData);
		const chosenWorker = allWorkers.find((worker) => worker._id.toHexString() === leastWorkedWorker); // get the worker id of the chosen worker
		const chosenWorkerScheduleId = chosenWorker.workSchedule.toHexString(); // get the schedule of the chosen worker
		const chosenWorkerSchedule = await Schedule.findById({ _id: chosenWorkerScheduleId }); // get the schedule of the chosen worker
		responseData[`ticket${n}`]["scheduleId"] = chosenWorkerScheduleId; // set schedule id in response data
		console.log(responseData);
		let chosenWorkerScheduleConverted = convertMapofMaps(chosenWorkerSchedule.schedule); // convert the schedule of the chosen worker to an object
		chosenWorkerScheduleConverted = convertTicketIdObjectsToHexString(chosenWorkerScheduleConverted); // convert ticket ids to strings
		const bumpedJobs = await collectBumpedJobs(chosenWorkerScheduleConverted, chosenTime, chosenDay, predictedTimeslots); // collect bumped jobs
		if (bumpedJobs.length > 0) {
			// if there are bumped jobs
			for (let job of bumpedJobs) {
				await schedule(job); // reschedule bumped jobs
				console.log("rescheduled bumped job");
			}
		}
		for (let i = 0; i < predictedTimeslots; i++) {
			// loop through the expected job length
			let time = chosenWorkerAvailTimes[chosenDay][i]; // get the time of the time block
			chosenWorkerScheduleConverted[chosenDay][time] = { ticketId }; // set the ticket id of the time block to the ticket id
		}
		await Schedule.findByIdAndUpdate({ _id: chosenWorkerSchedule._id }, { schedule: chosenWorkerScheduleConverted }); // save the schedule of the chosen worker
		await Ticket.findByIdAndUpdate({ _id: ticketId }, { assignedWorker: chosenWorker }); // set the assigned worker of the ticket to the chosen worker
	})(ticketId);
	return responseData;
}

module.exports = {
	getAvailWorkerTimes,
	convertTicketIdObjectsToHexString,
	collectBumpedJobs,
	findLeastWorkedWoker,
	autoSchedule
};
