//* IMPORTS
const router = require("express").Router();
const { authenticateUser } = require("../middleware/auth.middleware");

const {
	createProperty,
	deleteProperty,
	updateProperty,
	getProperty,
	getAllProperties
} = require("../controllers/property.controller");

router.post("/create", authenticateUser, createProperty);
router.delete("/delete/:id", authenticateUser, deleteProperty);
router.patch("/edit/:id", authenticateUser, updateProperty);
router.get("/all", authenticateUser, getAllProperties);
router.get("/find/:id", authenticateUser, getProperty);

module.exports = router;
