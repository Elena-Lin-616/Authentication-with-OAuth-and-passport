const passport = require("passport");
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const jwt = require("jsonwebtoken");
const secretOrKey = process.env.JWT_SECRET;
const User = require("../../db/models/userModel");

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async function (jwtPayload, cb) {
      // find user in db if needed
      try {
        const user = await User.findByPk(jwtPayload.id);
        if (!user) {
          return cb(null, false);
        }
        return cb(null, user);
      } catch (err) {
        console.log("jwt.js LINE 20", err);
        return cb(err);
      }
    }
  )
);

exports.protectByPassport = passport.authenticate("jwt", { session: false });

exports.restoreUser = (req, res, next) => {
  return passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) return next(err);
    if (user) req.user = user;
    next();
  })(req, res, next);
};
