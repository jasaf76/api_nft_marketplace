const User = require("./../models/userModels");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");


const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
//Update User Data
exports.updateMe = catchAsync(async (req, res, next) => {
  //1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirmed) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword", 400
      )
    );
  }
  //2) Check if user exists
  const filteredBody = filterObj(req.body, "name", "email");
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  
  res.status(200).json({
    status: "Success",
    message: "Benutzer erfolgreich aktualisiert",
    data: {
      user: updateUser,
    },
  });
});
  


///--USERS
exports.getAllUsers =catchAsync(async(req, res) => {
  const users = await User.find();
  
  //SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});
exports.createUsers = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
};
exports.getSingleUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  })
}