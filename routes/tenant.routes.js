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
router.post("/make-tenant/:userId", grantTenant);
router.delete("/remove-tenant/:userId", revokeTenant);
router.get("/get-tenant/:userId", getTenantById);
router.get("/get-all-tenants", getAllTenants);
router.post("/get-tenant-by-property", getTenantByPropertyId);

// * EXPORTS
module.exports = router;
