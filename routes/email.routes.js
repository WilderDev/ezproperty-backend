// * IMPORTS * //
const router = require("express").Router();
const {
	emailWorkerOnTicketAssignment,
	emailTenantOnWorkerAssignment,
	notifyOwnerOnBlockedTicket,
	notifyTenantOnBlockedTicket,
	sendPostFormToWorkerOnTicket,
	notifyOwnerOnTicketCompletion,
	notifyTenantOnTicketCompletion,
	emailOwnerOnTenantTicketRequest
} = require("../controllers/email.controller");
const { authenticateUser } = require("../middleware/auth.middleware");

// * ROUTES * //
router.post("/tenantOnWorkerAssignment", authenticateUser, emailTenantOnWorkerAssignment);

router.post("/workerOnTicketAssignment", authenticateUser, emailWorkerOnTicketAssignment);

router.post("/ownerOnBlockedTicket", authenticateUser, notifyOwnerOnBlockedTicket);

router.post("/tenantOnBlockedTicket", authenticateUser, notifyTenantOnBlockedTicket);

router.post("/ownerOnTicketCompletion", authenticateUser, notifyOwnerOnTicketCompletion);

router.post("/tenantOnTicketCompletion", authenticateUser, notifyTenantOnTicketCompletion);

router.post("/ownerOnTenantTicketRequest", authenticateUser, emailOwnerOnTenantTicketRequest);

router.post("/postFormToWorkerOnTicket", authenticateUser, sendPostFormToWorkerOnTicket);

// * EXPORTS * //
module.exports = router;
