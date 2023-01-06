const AppError = require("../utils/appError");

const handleJWTError = () => {
  return new AppError(
    "Ungültiger Token. Bitte loggen Sie sich erneut ein",
    401
  );
};
const handleJWTExpiredError = () => {
  return new AppError("Ihr Token ist abgelaufen. Bitte loggen Sie sich erneut ein", 401);
};

const handleCastErrorDB = (err) => {
  const message = `Ungültige ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(?<=")(?:\\.|[^"\\])*(?=")/);
  console.log(value);
  const message = `doppelte Feldwerte ${value}. Bitte verwenden Sie einen anderen Wert`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Ungültige Eingabedaten ${errors.join(". ")}`;

  return new AppError(message, 400);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
const sendErrorPro = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "etwas ist sehr schief gelaufen",
    });
  }
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError") error = handleValidationError(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    sendErrorPro(error, res);
  }
  next();
};
