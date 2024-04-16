//* IMPORTS
const router = require("express").Router();
const {
	createUserAsTenant,
	grantTenant,
	revokeTenant,
	getTenantById,
	getAllTenants,
	getTenantByPropertyId
} = require("../controllers/tenant.controller");
const { authenticateUser } = require("../middleware/auth.middleware");

// * ROUTES
router.post("/new-user", authenticateUser, createUserAsTenant);
router.post("/make-tenant/:userId", authenticateUser, grantTenant);
router.delete("/remove-tenant/:userId", authenticateUser, revokeTenant);
router.get("/get-tenant/:userId", authenticateUser, getTenantById);
router.get("/get-all-tenants", authenticateUser, getAllTenants);
router.post("/get-tenant-by-property", authenticateUser, getTenantByPropertyId);

// * EXPORTS
module.exports = router;
