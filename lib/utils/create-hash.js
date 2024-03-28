// * IMPORTs
const crypto = require("crypto");

// * FUNCTIONS
// Hash a string
const hashString = (string) => crypto.createHash("md5").update(string).digest("hex");

// * EXPORTS
module.exports = hashString;
