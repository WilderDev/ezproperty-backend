const User = require("../models/user.model");
const { good, bad } = require("../lib/utils/res");

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
	} = req.body;
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
	});
	await user.save();
	good({ res, status: 201, data: user });
};
const grantWorker = async (req, res) => {
	const { userId } = req.params;
	const { workSpecialization, startShift, endShift } = req.body;
	const foundUser = await User.findById(userId);
	if (!foundUser) {
		bad({ res, status: 404, message: "User Not Found" });
	}
	foundUser.workSpecialization = workSpecialization;
	foundUser.startShift = startShift;
	foundUser.endShift = endShift;
	await foundUser.save();
	good({ res, status: 200, data: foundUser });
};

const revokeWorker = async (req, res) => {
	const { userId } = req.params;
	const foundUser = await User.findById(userId);
	if (!foundUser) {
		bad({ res, status: 404, message: "User Not Found" });
	}
	delete foundUser.workSpecialization;
	delete foundUser.startShift;
	delete foundUser.endShift;
	await foundUser.save();
	good({ res, status: 200, data: foundUser });
};

const getWorkerById = async (req, res) => {
	const { userId } = req.params;
	const foundUser = await User.findById(userId);
	if (!foundUser) {
		bad({ res, status: 404, message: "User Not Found" });
	}
	good({ res, status: 200, data: foundUser });
};
const getAllWorkers = async (req, res) => {
	const workers = await User.find({ role: "WORKER" });
	good({ res, status: 200, data: workers });
};
const getWorkerByType = async (req, res) => {
	const { workSpecialization } = req.body;
	const workers = await User.find({ workSpecialization });
	good({ res, status: 200, data: workers });
};

const getWorkerByHours = async (req, res) => {
	const { startShift, endShift } = req.body;
	const workers = await User.find({
		startShift: { $gte: startShift },
		endShift: { $lte: endShift }
	});
	good({ res, status: 200, data: workers });
};

const changeShift = async (req, res) => {
	const { userId } = req.params;
	const { startShift, endShift } = req.body;
	const foundUser = await User.findById(userId);
	if (!foundUser) {
		bad({ res, status: 404, message: "User Not Found" });
	}
	foundUser.startShift = startShift;
	foundUser.endShift = endShift;
	await foundUser.save();
	good({ res, status: 200, data: foundUser });
};

const addSpecialization = async (req, res) => {
	const { userId } = req.params;
	const { workSpecialization } = req.body;
	const foundUser = await User.findById(userId);
	if (!foundUser) {
		bad({ res, status: 404, message: "User Not Found" });
	}
	foundUser.workSpecialization.push(workSpecialization);
	await foundUser.save();
	good({ res, status: 200, data: foundUser });
};

const removeSpecialization = async (req, res) => {
	const { userId } = req.params;
	const { workSpecialization } = req.body;
	const foundUser = await User.findById(userId);
	if (!foundUser) {
		bad({ res, status: 404, message: "User Not Found" });
	}
	foundUser.workSpecialization = foundUser.workSpecialization.filter(
		(spec) => spec !== workSpecialization
	);
	await foundUser.save();
	good({ res, status: 200, data: foundUser });
};

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
