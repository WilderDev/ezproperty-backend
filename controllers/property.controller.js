const Property = require("../models/Property.model");

const createProperty = async (req, res) => {
	const property = await Property.create(req.body);

	res.status(200).json({ success: true, data: { property } });
};
const deleteProperty = async (req, res) => {
	const { id: propertyID } = req.params;
	const property = await Property.findByIdAndDelete({ _id: propertyID });

	if (!property) {
		return res.status(404).json({ msg: `No property with id: ${property}` });
	}

	res.status(200).json({ success: true, data: { property } });
};
const updateProperty = async (req, res) => {
	const { id: propertyID } = req.params;
	const property = await Property.findByIdAndUpdate({ _id: propertyID }, req.body, {
		new: true,
		runValidators: true
	});

	console.log(property);

	res.status(200).json({ success: true, data: { property } });
};
const getProperty = async (req, res) => {
	const { id: propertyID } = req.params;
	const property = await Property.findOne({ _id: propertyID });

	if (!property) {
		return res.status(404).json({ msg: `No property found with id: ${propertyID}` });
	}

	res.status(200).json({ success: true, data: { property } });
};

const getAllProperties = async (req, res) => {
	const properties = await Property.find({});

	res.status(200).json({ success: true, data: { properties } });
};

module.exports = { createProperty, deleteProperty, updateProperty, getProperty, getAllProperties };
