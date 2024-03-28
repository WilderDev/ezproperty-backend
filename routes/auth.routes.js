// * IMPORTS
const router = require("express").Router(); // Import express router
const {
	registerUser,
	loginUser,
	verifyEmail,
	logoutUser,
	resetPass,
	forgotPass,
	resendVerification,
	me
} = require("../controllers/auth.controller");
const { authenticateUser } = require("../middleware/auth.middleware");

// * ROUTES
router.post("/register", registerUser); // Register a new user
router.post("/login", loginUser); // Login a user
router.delete("/logout", authenticateUser, logoutUser); // Logout a user
router.post("/verify", verifyEmail); // Verify email
router.post("/resend-verification", resendVerification);
router.post("/reset-password", resetPass); // Reset password
router.post("/forgot-password", forgotPass); // Forgot password
router.get("/me", authenticateUser, me); // Get user details

// * EXPORTS
module.exports = router;
