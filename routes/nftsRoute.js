const express = require("express");
const nftControllers = require("./../controllers/nftControllers");
const authController = require("./../controllers/authController");
// const {getAllNfts,getSingleNFT,createNFT,updateNFT,deleteNFT} = require("./../controllers/nftControllers");
const router = express.Router();
//router.param("id", nftControllers.checkId);
const NFT = require("./../models/nftModel");

///TOP 5 NFTs BY PRICE
router
  .route("/top-5-nfts")
  .get(nftControllers.aliasTopNFTs, nftControllers.getAllNfts);
// stats Route
router.route("/nfts-stats").get(nftControllers.getNFTsStats);
// Route get monthly plan

router.route("/monthly-plan/:year").get(nftControllers.getMonthlyPlan);
// ROUTER NFTs
router
  .route("/")
  .get(authController.protect, nftControllers.getAllNfts)
  // .post(nftControllers.checkBody, nftControllers.createNFT);
  .post(nftControllers.createNFT);

router
  .route("/:id")
  .get(nftControllers.getSingleNFT)
  .patch(nftControllers.updateNFT)
  .delete(
    authController.protect,
    authController.restrictTo("admin", "guide"),
    nftControllers.deleteNFT
  );

module.exports = router;
