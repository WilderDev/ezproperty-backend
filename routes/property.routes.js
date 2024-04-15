//* IMPORTS
const router = require("express").Router();

const {
	createProperty,
	deleteProperty,
	updateProperty,
	getProperty,
	getAllProperties
} = require("../controllers/property.controller");

router.post("/create", createProperty);
router.delete("/delete/:id", deleteProperty);
router.patch("/edit/:id", updateProperty);
router.get("/all", getAllProperties);
router.get("/find/:id", getProperty);

module.exports = router;
