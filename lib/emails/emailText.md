# Actual Website Link

     https://www.ezpropmanager.com/

# Email List:

## Step 1: Tenant fills issue form

     Email 1: Manager receives notification of ticket and ticket details (possible assign worker option)

     Email 2: Tenant receives notification that ticket has been sent (optional)

-   1:
    const newTicketNoticeEmail = async ({ username, email, passwordToken, url }) => {
    const loginLink = `${url}/login?token=${passwordToken}&email=${email}`; // Create the login link

        // Create the message
        const message = `<h2>New Ticket</h2><p>${username}, Please click on the following link to login to ezproperty.</p><br /><p><a href="${loginLink}" target="_blank">loginLink</a> to verify your email</p>`;

        // Send the email
        return sendEmail({ to: email, subject: "New Ticket", html: message });

    };

-   2:
    const newTicketConfirmationEmail = async ({ username, email, passwordToken, url }) => {
    const loginLink = `${url}/login?token=${passwordToken}&email=${email}`; // Create the login link

        // Create the message
        const message = `<h2>New Ticket Confirmation</h2><p>${username}, Your ticket has been submitted. Please login to ezproperty.</p><br /><p><a href="${loginLink}" target="_blank">loginLink</a> to verify your email</p>`;

        // Send the email
        return sendEmail({ to: email, subject: "New Ticket", html: message });

    };

## Step 2: Manager assigns Worker to Ticket

     Email 3: Worker emailed about scheduled day

     Email 4: Tenant is notified about scheduled day (option for reschedule if tenant not available)

     (Optional Email: Reschedule for Worker/Tenant)

## Step 3: Scheduled Day arrives

     Email 5: Worker sent Job Status Review Form

## Step 4a: Job is Blocked by Form

     Email 6: Manager is notified about ticket stop and details of stopped ticket

     Email 7: Tenant notified of next available service day

### Step 4b: Job is Completed

     Email 8: Manager notified ticket is completed

     Email 9: Tenant sent Job Review Survey Form

     Email 10: Manager sent results of Survey

# Other Emails:

    Verification emails for new Property Managers, Tenants, and Workers (Could be sent same email)

    Reset Password Email

    Other
