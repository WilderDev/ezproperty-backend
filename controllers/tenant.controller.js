const User = require("../models/User.model");
const Property = require("../models/Property.model");
const { good, bad } = require("../lib/utils/res");

// create new user as tenant
const createUserAsTenant = async (req, res) => {
	const {
		username,
		email,
		password,
		firstName,
		middleInitial,
		lastName,
		phoneNumber,
		propertyId,
		emergencyContactFirstName,
		emergencyContactLastName,
		emergencyContactRelationship,
		emergencyContactPhoneNumber
	} = req.body;
	const user = new User({
		username,
		email,
		password,
		firstName,
		middleInitial,
		lastName,
		role: ["TENANT"],
		phoneNumber,
		propertyId,
		emergencyContact: {
			firstName: emergencyContactFirstName,
			lastName: emergencyContactLastName,
			relationship: emergencyContactRelationship,
			phoneNumber: emergencyContactPhoneNumber
		}
	});
	const foundPropertyId = await Property.findOne({ _id: propertyId }); // find property by id
	if (!foundPropertyId) {
		// check if property exists
		bad({ res, status: 404, message: "Property not found" }); // return 404 if property not found
	}
	await user.save(); // save user
	good({ res, status: 201, data: user }); // return 201 and user data
};

// grants tenant role to a user
const grantTenant = async (req, res) => {
	const { userId } = req.params; // get userId from params
	const { propertyId } = req.body; // get propertyId from body
	const user = await User.findOne({ _id: userId }); // find user by id
	if (!user) {
		bad({ res, status: 404, message: "User not found" }); // return 404 if user not found
	}
	if (user.role.includes("TENANT")) {
		// check if user is already a tenant
		bad({ res, status: 400, message: "User is already a tenant" }); // return 400 if user is already a tenant
	}
	const foundPropertyId = await Property.findOne({ _id: propertyId }); // find property by id
	if (!foundPropertyId) {
		// check if property exists
		bad({ res, status: 404, message: "Property not found" }); // return 404 if property not found
	}
	user.propertyId = propertyId; // set propertyId to user
	user.role.push("TENANT"); // add tenant role to user
	await user.save(); // save user
	good({ res, status: 200, data: user }); // return 200 and user data
};

// revokes tenant role from a user
const revokeTenant = async (req, res) => {
	const { userId } = req.params; // get userId from params
	const { propertyId } = req.body; // get propertyId from body
	const user = await User.findOne({ _id: userId }); // find user by id
	if (!user) {
		bad({ res, status: 404, message: "User not found" }); // return 404 if user not found
	}
	if (!user.role.includes("TENANT")) {
		// check if user is a tenant
		bad({ res, status: 400, message: "User is not a tenant" }); // return 400 if user is not a tenant
	}
	const foundPropertyId = await Property.findOne({ _id: propertyId });
	if (!foundPropertyId) {
		// check if property exists
		bad({ res, status: 404, message: "Property not found" }); // return 404 if property not found
	}
	user.propertyId = null; // remove propertyId from user
	user.role = user.role.filter((role) => role !== "TENANT"); // remove tenant role from user
	await user.save(); // save user
	good({ res, status: 200, data: user }); // return 200 and user data
};

// get tenant by id
const getTenantById = async (req, res) => {
	const { userId } = req.params; // get userId from params
	const user = await User.findOne({ _id: userId, role: "TENANT" }); // find tenant by id and role
	if (!user) {
		bad({ res, status: 404, message: "User not found" }); // return 404 if user not found
	}
	good({ res, status: 200, data: user }); // return 200 and user data
};

// get all tenants
const getAllTenants = async (req, res) => {
	const tenants = await User.find({ role: "TENANT" }); // find all tenants
	good({ res, status: 200, data: tenants }); // return 200 and tenants data
};

// get tentant by propertyId
const getTenantByPropertyId = async (req, res) => {
	const { propertyId } = req.body; // get propertyId from body
	const foundPropertyId = await Property.findOne({ _id: propertyId }); // find property by id
	if (!foundPropertyId) {
		// check if property exists
		bad({ res, status: 404, message: "Property not found" }); // return 404 if property not found
	}
	const tenants = await User.find({ role: "TENANT", foundPropertyId }); // find tenants by propertyId
	if (!tenants) {
		bad({ res, status: 404, message: "Tenants not found" }); // return 404 if tenants not found
	}
	good({ res, status: 200, data: tenants }); // return 200 and tenants data
};

module.exports = {
	createUserAsTenant,
	grantTenant,
	revokeTenant,
	getTenantById,
	getAllTenants,
	getTenantByPropertyId
};
