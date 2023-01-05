const express = require("express");
const passport = require("passport");
const {
  signup,
  login,
  protect,
  logout,
  restrictTo,
  forgetPassword,
  resetPassword,
} = require("../controllers/authController");

const {
  testForFilter,
  updatePassword,
  updateMe,
  deleteMe,
  getAllUsers,
} = require("../controllers/userController");

const router = express.Router();

// test for beforeFind hook to exclude active = false
router.get("/test", testForFilter);

router.post("/signup", signup);

// use passport-local to use email & password to login
// after requireSign in, set req.user
// error : 401 Unauthorized

// login middlware to create & response token to user
const requireSignin = passport.use("local", { session: false });
router.post("/login/password", requireSignin, login);

router.post("/login/password", login);
router.post("/logout", protect, logout);

router.post("/forgotPassword", forgetPassword);
router.post("/resetPassword/:token", resetPassword);

router.put("/updateMypassword", protect, updatePassword);
router.put("/updateMe", protect, updateMe);
router.delete("/deleteMe", protect, deleteMe);

// 2 way to implement protect middleware
// protect : error message: 401 You are not logged in yet, please login first
// passport.authenticate('jwt', {session:false}) ->
// 401 Unauthorized
// auto set req.user as currect user

// router.route("/").get(protect, restrictTo("admin"), getAllUsers);
// router
//   .route("/")
//   .get(passport.authenticate("jwt", { session: false }), getAllUsers);

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.send(req.user);
  }
);

module.exports = router;
