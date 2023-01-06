///-----Part 3
const NFT = require("./../models/nftModel");
const APIFeatures = require("./../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.aliasTopNFTs = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage, difficulty";
  next();
};

exports.getAllNfts = catchAsync(async (req, res, next) => {
  // // BUILD QUERY
  const features = new APIFeatures(NFT.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  // console.log(JSON.stringify(features));
  const nfts = await features.query;
  //SEND QUERY
  res.status(200).json({
    status: "OK",
    results: nfts.length,
    data: {
      nfts,
    },
  });
});

//Post method
exports.createNFT = catchAsync(async (req, res, next) => {
  const newNFT = await NFT.create(req.body);
  res.status(201).json({
    status: "OK",
    data: {
      nft: newNFT,
    },
  });
});

//Get Single nft
exports.getSingleNFT = catchAsync(async (req, res, next) => {
  const nft = await NFT.findById(req.params.id);

  if (!nft) {
    return next(new AppError("Kein NFT unter dieser Adresse gefunden", 404));
  }

  res.status(200).json({
    status: "OK",
    data: {
      nft,
    },
  });
});
// Patch Method
exports.updateNFT = catchAsync(async (req, res, next) => {
  const nft = await NFT.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!nft) {
    return next(new AppError("Kein NFT unter dieser Adresse gefunden", 404));
  }
  res.status(200).json({
    status: "OK",
    data: {
      nft,
    },
  });
});

// Delet Method
exports.deleteNFT = catchAsync(async (req, res, next) => {
  const nft = await NFT.findByIdAndDelete(req.params.id);
  if (!nft) {
    return next(new AppError("Kein NFT unter dieser Adresse gefunden", 404));
  }
  res.status(204).json({
    status: "OK",
    data: null,
  });
});

//Aggregation PIPELINE
exports.getNFTsStats = catchAsync(async (req, res, next) => {
  const stats = await NFT.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        // _id:"$ratingsAverage",
        numNFT: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgRating: 1 },
    },
    {
      $match: {
        _id: { $ne: " EASY" },
      },
    },
  ]);
  res.status(200).json({
    status: "OK",
    data: {
      stats,
    },
  });
});
//CALCULATING NUMBER OF NFTS CREATE IN THE MONTH OR MONTHLY PLAN
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await NFT.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-02-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numNFTStarts: { $sum: 1 },
        nfts: { $push: "$name" },
      },
    },
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numNFTStarts: -1 },
    },
    {
      $limit: 10,
    },
  ]);
  res.status(200).json({
    status: "OK",
    data: plan,
  });
});
