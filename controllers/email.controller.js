// * IMPORTS * //
const { sendEmail } = require("../lib/emails/nodemailer");
const { good, bad } = require("../lib/utils/res");

// * CONTROLLERS * //
// Email the owner once a tenant has made a ticket request, so he can schedule a worker and a time
const emailOwnerOnTenantTicketRequest = async (req, res) => {
	// Get the information from the req body
	const { tenantName, issueType, issueDesc, issuePriority, address } = req.body;

	if (!tenantName || !issueType || !issueDesc || !issuePriority || !address) {
		return bad({ res, message: "Not all needed information was provided" });
	}

	// AI solution
	const solution = ""; // TODO: AI SOLUTION

	// TODO: Get the owner???
	const to = "owner@test.com";

	// Subject of the email
	const subject = `Ticket Request from ${tenantName} at ${address}`;

	// ! DEV ORIGIN
	const origin = "http://localhost:4200";

	// Main message of the email
	// TODO: Priority buttons to select priority of issue
	const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
    <p style="font-size: 16px;">Dear Owner,</p>
    <p style="font-size: 16px;">This is a ticket request from ${tenantName} regarding an issue at the property located at ${address}.</p>
    
    <p style="font-size: 16px;">Issue Type: ${issueType}</p>
    <p style="font-size: 16px;">Issue Description: ${issueDesc}</p>
    <p style="font-size: 16px;">Issue Priority: ${issuePriority || "Not specified"}</p>
    
    <p style="font-size: 16px;">Here is the proposed solution: ${solution}</p>
    
    <p style="font-size: 16px;">Please select the priority of the issue:</p>
    
    <div style="margin-bottom: 20px;">
        <a href="${origin}/low" style="background-color: #ffff00; color: #000000; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">Low Priority</a>
        <a href="${origin}/medium" style="background-color: #ffa500; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">Medium Priority</a>
        <a href="${origin}/high" style="background-color: #ff0000; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">High Priority</a>
        <a href="${origin}/urgent" style="background-color: #ff0000; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Urgent Priority</a>
    </div>
    
    <p style="font-size: 16px;">A worker will be sent to the premise as soon as possible.</p>
    
    <p style="font-size: 16px;">Thank you.</p>
    
    <p style="font-size: 16px;">Sincerely,<br>EzProperty Team</p>
</div>
    `;

	// send the email
	await sendEmail({ to, subject, html: message });

	// send success
	good({ res, data: "Email sucecssfully sent to owner" });
};

// TODO: Email the woker once they were assigned to a ticket
// Will need to take in (tenantName, issueType, issueDesc, issuePirority?, address, solution, time)
const emailWorkerOnTicketAssignment = async (req, res) => {};

// TODO: Email the tenant once a worker was assigned to a ticket
// Will need to take in (worker, time, solution)
const emailTenantOnWorkerAssignment = async (req, res) => {};

// TODO: Send a post form at the time of the ticket to the worker (if it needs to be blocked or completed)
const sendPostFormToWorkerOnTicket = async (req, res) => {};
// Send form with two buttons, Completed or blocked

// If completed then procceed with completed emails

// If failed take them to a form to input why it was blocked

// ! BLOCKED ! //
// TODO: if the ticket is blocked, then send an email to the owner on why it was blocked and have him decide the reschedule
// Will need to take in (tenantName, issueType, issueDesc, img?, issuePirority?, address)
const notifyOwnerOnBlockedTicket = async (req, res) => {};

// ? Allow owner to change the issue priority

// Assign a new worker and repeat the process else just send the tenant an estamation on when it can be fixed

// ! BLOCKED ! //
// TODO: if the ticket is blocked, then send a email to the tenant on why and the estament to when it can be fixed
// Will need to take in (why, when)
const notifyTenantOnBlockedTicket = async (req, res) => {};

// * COMPLETED * //
// TODO: if the ticket is completed, then send an email to the owner that it was successfully completed
// Will need to take in (tenantName, issueType, issueDesc, img?, issuePirority?, address, review)
const notifyOwnerOnTicketCompletion = async (req, res) => {};

// * COMPLETED * //
// TODO: if the ticket is completed, then send an email to the tenant and give them a review form for the fix
// Send the tenant an email with a link to a specified review for the fix
const notifyTenantOnTicketCompletion = async (req, res) => {};

// * EXPORTS * //
module.exports = {
	emailWorkerOnTicketAssignment,
	emailTenantOnWorkerAssignment,
	notifyOwnerOnBlockedTicket,
	notifyTenantOnBlockedTicket,
	sendPostFormToWorkerOnTicket,
	notifyOwnerOnTicketCompletion,
	notifyTenantOnTicketCompletion,
	emailOwnerOnTenantTicketRequest
};
