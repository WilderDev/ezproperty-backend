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

// * ROUTES
router.post("/new-user", createUserAsTenant);
router.post("/make-tenant/:userId", grantTenant);
router.delete("/remove-tenant/:userId", revokeTenant);
router.get("/get-tenant/:userId", getTenantById);
router.get("/get-all-tenants", getAllTenants);
router.post("/get-tenant-by-property", getTenantByPropertyId);

// * EXPORTS
module.exports = router;
