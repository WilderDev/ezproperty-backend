// * IMPORTS * //
const { sendEmail } = require("../emails/nodemailer");

// * EMAILS * //
// TODO: Email the owner once a tenant has made a ticket request, so he can schedule a worker and a time
const assignWorkerEmail = async (tenantName, issueType, issueDesc, issuePriority, address) => {
	// AI solution
	const solution = ""; // TODO: AI SOLUTION

	// Subject of the email
	const subject = "Ticket Request: Worker Assignment Needed";
	// Main message of the email
	// TODO: Priority buttons to select priority of issue
	const message = `
    Dear Owner,<br><br>

    This is a ticket request from ${tenantName} regarding an issue at the property located at ${address}.<br><br>

    Issue Type: ${issueType}<br>
    Issue Description: ${issueDesc}<br>
    Issue Priority: ${issuePriority || "Not specified"}<br><br>

    Here is the proposed solution: ${solution}<br>


    Please review the ticket and schedule a worker accordingly.<br><br>
 
    Thank you.<br><br>

    Sincerely,<br>EzProperty
    `;
};

// TODO: Email the woker once they were assigned to a ticket
// Will need to take in (tenantName, issueType, issueDesc, img?, issuePirority?, address, solution, time)

// TODO: Email the tenant once a worker was assigned to a ticket
// Will need to take in (worker, time, solution)

// TODO: Send a post form at the time of the ticket to the worker (if it needs to be blocked or completed)
// Send form with two buttons, Completed or blocked

// If completed then procceed with completed emails

// If failed take them to a form to input why it was blocked

// ! BLOCKED ! //
// TODO: if the ticket is blocked, then send an email to the owner on why it was blocked and have him decide the reschedule
// Will need to take in (tenantName, issueType, issueDesc, img?, issuePirority?, address)

// ? Allow owner to change the issue priority

// Assign a new worker and repeat the process else just send the tenant an estamation on when it can be fixed

// ! BLOCKED ! //
// TODO: if the ticket is blocked, then send a email to the tenant on why and the estament to when it can be fixed
// Will need to take in (why, when)

// * COMPLETED * //
// TODO: if the ticket is completed, then send an email to the owner that it was successfully completed
// Will need to take in (tenantName, issueType, issueDesc, img?, issuePirority?, address, review)

// * COMPLETED * //
// TODO: if the ticket is completed, then send an email to the tenant and give them a review form for the fix
// Send the tenant an email with a link to a specified review for the fix

// * EXPORTS * //
module.exports = {
	assignWorkerEmail
};
