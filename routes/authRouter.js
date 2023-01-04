const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");

// Login with passport
router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      console.log(err);
      return res.status(400).json({
        messsage: info,
        user: user,
      });
    }

    // login user
    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }

      // generate a signe web token with the user id and return in response
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      user.excludePasswordField();
      return res.status(200).json({
        token,
        user,
      });
    });
  })(req, res);
});

module.exports = router;
