const successResponse = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    timestamp: new Date().toISOString(),
    ...data
  });
};

const errorResponse = (res, message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse
};