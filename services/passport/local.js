const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../../db/models/userModel");

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   const user = await User.findByPk(id);
//   done(null, user);
// });

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async function verify(email, password, cb) {
      try {
        const user = await User.findOne({
          where: {
            email,
          },
        });
        if (!user || !(await user.correctPassword(password))) {
          return cb(null, false, { message: "Incorrect email or password" });
        }
        return cb(null, user, { message: "Logged in Successfully" });
      } catch (err) {
        console.log("local.js Line 22", err);
        cb(err);
      }
    }
  )
);
