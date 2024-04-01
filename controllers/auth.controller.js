// * IMPORTS
const User = require("../models/User.model.js");
const Token = require("../models/Token.model.js");
const crypto = require("crypto");
const { sendResetPasswordEmail, sendVerificationEmail } = require("../lib/emails/nodemailer");
const { attachCookies } = require("../lib/auth/jwt");
const { good, bad } = require("../lib/utils/res");

// * CONTROLLERS
// CONTROLLER: Register User
const registerUser = async (req, res) => {
	const { email, password1, password2, username } = req.body; // Destructure the email, password, and username from the request body

	const emailAlreadyExists = await User.findOne({ email }); // Check if the email is already taken

	// If the email is already taken, send a 400 response
	if (emailAlreadyExists) {
		return bad({ res, message: "Invalid username or email" });
	}

	const usernameTaken = await User.findOne({ username }); // Check if the username is already taken

	// If the username is already taken, send a 400 response
	if (usernameTaken) {
		return bad({ res, message: "Invalid username or email" });
	}

	const isFirstUser = (await User.countDocuments({})) === 0; // Check if the user is the first user
	const role = isFirstUser ? "manager" : "tenant"; // If the user is the first user, set the role to "manager", otherwise set it to "tenant"

	const verificationToken = crypto.randomBytes(2 ** 8).toString("hex"); // Generate a verification token

	// If the email, password, or username is missing, send a 400 response
	if (!email || !password1 || !password2 || !username) {
		return bad({ res, message: "Invalid Fields" });
	}

	// If the passwords don't match, send a 400 response
	if (password1 !== password2) {
		return bad({ res, message: "Passwords do not match" });
	}

	// Create a new user
	const user = await User.create({
		email,
		password: password1,
		username,
		role,
		verificationToken
	});

	let serverUrlString = process.env.SERVER_URL; // TODO: Set this to the server URL depending on the environment

	// Send a verification email
	await sendVerificationEmail({
		username: user.username,
		email: user.email,
		verificationToken: user.verificationToken,
		url: serverUrlString
	});

	return good({ res, data: { user } }); // Send a 200 response with the user
};

// CONTROLLER: Login User
const loginUser = async (req, res) => {
	const { email, password } = req.body; // Destructure the email and password from the request body

	// If the email or password is missing, send a 400 response
	if (!email || !password) {
		return bad({ res, message: "Email or password not valid" });
	}

	const user = await User.findOne({ email }); // Find the user by email

	// If the user doesn't exist, send a 401 response
	if (!user) {
		return bad({ res, status: 401, message: "Invalid username or password" });
	}

	const isPassCorrect = await user.comparePass(password); // Compare the password with the hashed password

	// If the password is incorrect, send a 401 response
	if (!isPassCorrect) {
		return bad({ res, status: 401, message: "Invalid username or password" });
	}

	// If the user isn't verified, send a 401 response
	if (!user.isVerified) {
		return bad({ res, status: 401, message: "Email not verified" });
	}

	const tokenUser = { name: user.username, userId: user._id, role: user.role }; // Create a token user
	let refreshToken = ""; // Create a refresh token

	const existingToken = await Token.findOne({ user: user._id }); // Find an existing token

	// If the token exists, check if it's valid
	if (existingToken) {
		const { isValid } = existingToken; // Destructure the isValid property from the existing token

		// If the token isn't valid, send a 401 response
		if (!isValid) {
			return bad({ res, status: 401, message: "Unauthorized" });
		}

		refreshToken = existingToken.refreshToken; // Set the refresh token to the existing token's refresh token

		attachCookies({ res, user: tokenUser, refreshToken }); // Attach the cookies

		return good({ res, data: { user: tokenUser } }); // Send a 200 response with the user
	}

	refreshToken = crypto.randomBytes(40).toString("hex");
	const userAgent = req.headers["user-agent"];
	const ip = req.ip;
	const userToken = { refreshToken, ip, userAgent, user: user._id };

	await Token.create(userToken);

	attachCookies({ res, user: tokenUser, refreshToken });
	res.status(200).json({ success: true, data: { user: tokenUser } });
};

// CONTROLLER: Logout User
const logoutUser = async (req, res) => {
	await Token.findOneAndDelete({ user: req.user.userId }); // Find and delete the token

	// Attach the cookies
	res.cookie("accessToken", "logout", {
		httpOnly: true,
		expires: new Date(Date.now())
	});
	res.cookie("refreshToken", "logout", {
		httpOnly: true,
		expires: new Date(Date.now())
	});

	return good({ res, data: { message: "user logged out" } }); // Send a 200 response
};

// CONTROLLER: Forgot Password
const forgotPass = async (req, res) => {
	const { email } = req.body; // Destructure the email from the request body

	// If the email is missing, send a 400 response
	if (!email) {
		return bad({ res, message: "Invalid email" });
	}

	const user = await User.findOne({ email }); // Find the user by email

	let serverUrlString = process.env.SERVER_URL; // TODO: Set this to the server URL depending on the environment

	// If the user exists, send a reset password email
	if (user) {
		const passwordToken = crypto.randomBytes(70).toString("hex"); // Generate a password token
		// Send a reset password email
		await sendResetPasswordEmail({
			username: user.username,
			email: user.email,
			passwordToken: passwordToken,
			url: serverUrlString
		});

		const tenMinutes = 1000 * 60 * 10; // Set the expiration date to 10 minutes
		const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes); // Set the expiration date

		user.passwordToken = passwordToken; // Set the password token
		user.passwordTokenExpirationDate = passwordTokenExpirationDate; // Set the expiration date

		await user.save(); // Save the user
		//TODO Remove password token from res
		return good({ res, data: { message: "Check your email for reset link", passwordToken } }); // Send a 200 response
	}
};

// CONTROLLER: Reset Password
const resetPass = async (req, res) => {
	const { token, email, password } = req.body; // Destructure the token, email, and password from the request body

	// If the token, email, or password is missing, send a 400 response
	if (!token || !email || !password) {
		return bad({ res, message: "Invalid token, email, or password" });
	}

	const user = await User.findOne({ email }); // Find the user by email

	// If the user doesn't exist, send a 400 response
	if (user && user.passwordToken && user.passwordTokenExpirationDate) {
		const currentDate = new Date(); // Get the current date

		// If the password token and expiration date are valid, reset the password
		if (user.passwordToken === token && user.passwordTokenExpirationDate > currentDate) {
			user.password = password; // Set the password
			user.passwordToken = null; // Set the password token to null
			user.passwordTokenExpirationDate = null; // Set the expiration date to null

			await user.save(); // Save the user

			return good({ res, data: { message: "Success: Reset password" } }); // Send a 200 response
		} else {
			return bad({ res, message: "Invalid token" }); // Send a 400 response
		}
	} else {
		return bad({ res, message: "Please try again" }); // Send a 400 response
	}
};

// CONTROLLER: Verify Email
const verifyEmail = async (req, res) => {
	const { verificationToken, email } = req.body; // Destructure the verification token and email from the request body

	const user = await User.findOne({ email }); // Find the user by email

	// If the user doesn't exist, send a 401 response
	if (!user) {
		return bad({ res, status: 401, message: "Verification failed" });
	}

	// If the user is already verified, send a 401 response
	if (user.verificationToken !== verificationToken) {
		return bad({ res, status: 401, message: "Verification failed" });
	}

	user.isVerified = true; // Set the user to verified
	user.verified = Date.now(); // Set the verified date
	user.verificationToken = ""; // Set the verification token to an empty string

	await user.save(); // Save the user

	return good({ res, data: { message: "Success: Email verified" } }); // Send a 200 response
};

// CONTROLLER: Resend Verification Email
const resendVerification = async (req, res) => {
	// Destructure the email from the request body
	const { email } = req.body;

	// Find the user by their email in the database
	const user = await User.findOne({
		email
	});

	// Define a variable to hold the server URL string
	let serverUrlString = process.env.SERVER_URL; //TODO Same as on register user

	// Send a verification email to the user
	await sendVerificationEmail({
		// Pass the user's username, email, verification token, and server URL to the email sending function
		username: user.username,
		email: user.email,
		verificationToken: user.verificationToken,
		url: serverUrlString
	});

	// Send a successful response (HTTP 200) with the user data
	return good({ res, data: { user } });
};

// CONTROLLER: Me
const me = async (req, res) => {
	const user = await User.findOne({ _id: req.user.userId }); // Find the user by id

	// If the user doesn't exist, send a 401 response
	if (!user) {
		return bad({ res, status: 401, message: "User not found" });
	}

	return good({
		res,
		data: {
			user: { id: user._id, email: user.email, username: user.username, role: user.role }
		}
	}); // Send a 200 response with the user
};

// * EXPORTS
module.exports = {
	registerUser,
	loginUser,
	logoutUser,
	forgotPass,
	resetPass,
	verifyEmail,
	resendVerification,
	me
};
