//* IMPORTS
const User = require("../models/User.model");
const { good, bad } = require("../lib/utils/res");

// * CONTROLLERS
// create new user as worker
const createUserAsWorker = async (req, res) => {
	const {
		username,
		email,
		password,
		firstName,
		middleInitial,
		lastName,
		phoneNumber,
		emergencyContactFirstName,
		emergencyContactLastName,
		emergencyContactRelastionship,
		emergencyContactPhoneNumber,
		workSpecialization
	} = req.body; // get user data from body
	const user = new User({
		username,
		email,
		password,
		firstName,
		middleInitial,
		lastName,
		role: ["WORKER"],
		phoneNumber,
		emergencyContact: {
			firstName: emergencyContactFirstName,
			lastName: emergencyContactLastName,
			relationship: emergencyContactRelastionship,
			phoneNumber: emergencyContactPhoneNumber
		},
		workSpecialization
	}); // create new user
	await user.save(); // save user
	return good({ res, status: 201, data: user }); // return 201 and user data
};
// grants worker role to a user
const grantWorker = async (req, res) => {
	const { userId } = req.params; // get user id from params
	const { workSpecialization, startShift, endShift } = req.body; // get work specialization, start shift, and end shift from body
	const foundUser = await User.findById(userId); // find user by id
	if (!foundUser) {
		// if user not found
		return bad({ res, status: 404, message: "User Not Found" }); // return 404 if user not found
	}
	foundUser.workSpecialization = workSpecialization; // set work specialization
	foundUser.startShift = startShift; // set start shift
	foundUser.endShift = endShift; // set end shift
	await foundUser.save(); // save user
	return good({ res, status: 200, data: foundUser }); // return 200 and worker data
};

// revokes worker role from a user
const revokeWorker = async (req, res) => {
	const { userId } = req.params; // get user id from params
	const foundUser = await User.findById(userId); // find user by id
	if (!foundUser) {
		// if user not found
		return bad({ res, status: 404, message: "User Not Found" }); // return 404 if user not found
	}
	delete foundUser.workSpecialization; // delete work specialization
	delete foundUser.startShift; // delete start shift
	delete foundUser.endShift; // delete end shift
	await foundUser.save(); // save user
	return good({ res, status: 200, data: foundUser }); // return 200 and worker data
};

// get worker by id
const getWorkerById = async (req, res) => {
	const { userId } = req.params; // get user id from params
	const foundUser = await User.findById(userId); // find user by id
	if (!foundUser) {
		// if user not found
		return bad({ res, status: 404, message: "User Not Found" }); // return 404 if user not found
	}
	return good({ res, status: 200, data: foundUser }); // return 200 and worker data
};

// get all workers
const getAllWorkers = async (req, res) => {
	const workers = await User.find({ role: "WORKER" }); // find all users with role WORKER
	return good({ res, status: 200, data: workers }); // return 200 and workers data
};

// get worker by work specialization
const getWorkerByType = async (req, res) => {
	const { workSpecialization } = req.body; // get work specialization from body
	const workers = await User.find({ workSpecialization }); // find all users with work specialization
	return good({ res, status: 200, data: workers }); // return 200 and workers data
};

// get worker between start and end shift hours
const getWorkerByHours = async (req, res) => {
	const { startShift, endShift } = req.body; // get start and end shift from body
	const workers = await User.find({
		// find all users with start and end shift
		startShift: { $gte: startShift }, // start shift greater than or equal to start shift
		endShift: { $lte: endShift } // end shift less than or equal to end shift
	});
	return good({ res, status: 200, data: workers }); // return 200 and workers data
};

// change worker shift begin and end times
const changeShift = async (req, res) => {
	const { userId } = req.params; // get user id from params
	const { startShift, endShift } = req.body; // get start and end shift from body
	const foundUser = await User.findById(userId); // find user by id
	if (!foundUser) {
		// if user not found
		return bad({ res, status: 404, message: "User Not Found" }); // return 404 if user not found
	}
	foundUser.startShift = startShift; // set start shift
	foundUser.endShift = endShift; // set end shift
	await foundUser.save(); // save user
	return good({ res, status: 200, data: foundUser }); // return 200 and worker data
};

// add specialization to worker
const addSpecialization = async (req, res) => {
	const { userId } = req.params; // get user id from params
	const { workSpecialization } = req.body; // get work specialization from body
	const foundUser = await User.findById(userId); // find user by id
	if (!foundUser) {
		// if user not found
		return bad({ res, status: 404, message: "User Not Found" }); // return 404 if user not found
	}
	foundUser.workSpecialization.push(workSpecialization); // add work specialization
	await foundUser.save(); // save user
	return good({ res, status: 200, data: foundUser }); // return 200 and worker data
};

// remove specialization from worker
const removeSpecialization = async (req, res) => {
	const { userId } = req.params; // get user id from params
	const { workSpecialization } = req.body; // get work specialization from body
	const foundUser = await User.findById(userId); // find user by id
	if (!foundUser) {
		// if user not found
		return bad({ res, status: 404, message: "User Not Found" }); // return 404 if user not found
	}
	foundUser.workSpecialization = foundUser.workSpecialization.filter(
		(spec) => spec !== workSpecialization
	); // remove work specialization
	await foundUser.save(); // save user
	return good({ res, status: 200, data: foundUser }); // return 200 and worker data
};

// * EXPORTS
module.exports = {
	createUserAsWorker,
	grantWorker,
	revokeWorker,
	getWorkerById,
	getAllWorkers,
	getWorkerByType,
	getWorkerByHours,
	changeShift,
	addSpecialization,
	removeSpecialization
};
