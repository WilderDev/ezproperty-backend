// TODO
// * IMPORTS
const { good, bad } = require("../lib/utils/res"); // TODO: Use these functions to send responses

// * CONTROLLERS
const doSomething = async (req, res) => {
	let { thing } = req.body;
	if (thing === "not good") {
		bad({ res, status: 400, data: { message: "nope. not good." } });
	}
	good({ res, status: 200, data: { message: "everything all good." } });
};

module.exports = { doSomething };
