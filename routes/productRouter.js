const express = require("express");
const {
  getAllProduct,
  createNewProduct,
} = require("../controllers/productController");
const { protect, restrictTo } = require("../controllers/authController");
const router = express.Router();
// const { protectByPassport } = require("../services/passport/jwt");

router
  .route("/")
  .get(protect, getAllProduct)
  .post(protect, restrictTo("admin"), createNewProduct);

module.exports = router;
