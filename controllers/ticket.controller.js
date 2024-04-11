const Ticket = require("../models/Ticket.model");
const User = require("../models/User.model");
const Schedule = require("../models/Schedule.model");

const createTicket = async (req, res) => {
	const ticket = await Ticket.create(req.body);

	res.status(200).json({ success: true, data: { ticket } });
};
const deleteTicket = async (req, res) => {
	const { id: ticketID } = req.params;
	const ticket = await Ticket.findByIdAndDelete({ _id: ticketID });

	if (!ticket) {
		return res.status(404).json({ msg: `No ticket with id: ${ticket}` });
	}

	res.status(200).json({ success: true, data: { ticket } });
};
const updateTicket = async (req, res) => {
	const { id: ticketID } = req.params;
	const ticket = await Ticket.findByIdAndUpdate({ _id: ticketID }, req.body, {
		new: true,
		runValidators: true
	});

	console.log(ticket);

	res.status(200).json({ success: true, data: { ticket } });
};
const getTicket = async (req, res) => {
	const { id: ticketID } = req.params;
	const ticket = await Ticket.findOne({ _id: ticketID });

	if (!ticket) {
		return res.status(404).json({ msg: `No ticket found with id: ${ticketID}` });
	}

	res.status(200).json({ success: true, data: { ticket } });
};

const getAllTickets = async (req, res) => {
	const tickets = await Ticket.find({});

	res.status(200).json({ success: true, data: { tickets } });
};

const assignWorkerManual = async (req, res) => {
	const { id: ticketID } = req.params;
	const { workerId } = req.body;
	const ticket = await Ticket.findOne({ _id: ticketID });
	const worker = await User.findOne({ _id: workerId });
	ticket.assignedWorker = worker;
	await ticket.save();
};

const assignWorkerAuto = async (req, res) => {
	const { id: ticketID } = req.params;
	const { priority, expectedTimeslots } = req.body;
	const ticket = await Ticket.findOne({ _id: ticketID });
	const allWorkers = await User.find({});
	const specializedWorkers = allWorkers.filter((worker) => worker.specialty === ticket.type);
	let workerStartTimes = {};
	for (let worker of specializedWorkers) {
		const schedule = await Schedule.findOne({ _id: worker.schedule });
		let startTimes = {};
		let counter = 0;
		let scheduleValues = Object.values(schedule);
		let scheduleKeys = Object.keys(schedule);
		for (let dayIndex = 0; dayIndex < scheduleValues.length; dayIndex++) {
			let dayEntries = Object.entries(scheduleValues[dayIndex]);
			let dayKeys = Object.keys(scheduleValues[dayIndex]);
			beginTime: for (let i = 0; i < dayEntries.length; i++) {
				endTime: for (let j = i + 1; j < expectedTimeslots + 1; j++) {
					if (scheduleValues[dayIndex][dayKeys[i]] == null) {
						break beginTime;
					}
					if (scheduleValues[dayIndex][dayKeys[i]].ticketId != null) {
						if (scheduleValues[dayIndex][dayKeys[i]].ticketId == undefined) {
							counter++;
						}
						//logic to look at priority
					}
					if (counter == expectedTimeslots) {
						startimes[scheduleKeys[]]
						startTimes.push(scheduleValues[dayIndex][i]);
						i = j;
						break endTime;
					}
				}
			}
		}

		const workerId = worker["_id"];
		workerStartTimes[workerId] = startTimes;
	}
};

module.exports = {
	createTicket,
	deleteTicket,
	updateTicket,
	getTicket,
	getAllTickets,
	assignWorkerManual,
	assignWorkerAuto
};
