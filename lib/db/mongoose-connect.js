// * IMPORTS
const mongoose = require('mongoose');

// * METHODS
function connectToMongo(dbConnectionString) {
  // Try to connect to the Mongo Database
  try {
    const dbConnection = mongoose.connect(dbConnectionString); // Connect to the Mongo Database

    // Create a variable to store the name of the Mongo Database
    const MONGO_DB_NAME = dbConnectionString
      .split('mongodb.net/')[1]
      .split('?')[0];

      // Log the name of the Mongo Database
    console.log(`Connected to the Mongo Database Named: "${MONGO_DB_NAME}"`);

    return dbConnection; // Return the connection
  } catch (err) {
    console.log('ERROR CONNECTING TO DB:', err); // Log the error
  }
}

// * EXPORTS
module.exports = connectToMongo;
