// * METHODS
// SUCCCESS RESPONSE
function good({ res, status = 200, data = {} }) {
  return res.status(status).json({
    success: true,
    error: null,
    data,
  });
}

// ERROR RESPONSE
function bad({ res, status = 400, message = 'Uh oh! Something went wrong.' }) {
  return res.status(status).json({
    success: false,
    error: {
      status,
      message,
    },
    data: null,
  });
}

// * EXPORTS
module.exports = {
  good,
  bad,
};
