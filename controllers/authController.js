const asyncHandler = require("express-async-handler");
const passport = require("passport");
const { User } = require("../db");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const Sequelize = require("sequelize");
const AppError = require("../utils/appError");

// @desc: Create new user
// @route: POST /api/users/signup
// @access: Private
const signup = asyncHandler(async (req, res, next) => {
  // 1. create user
  const { name, email, password, passwordConfirm } = req.body;
  if (!name || !email || !password || !passwordConfirm) {
    throw new AppError(
      "Name, email, password, passwordConfirm  are required.",
      400
    );
  }

  // check if user with this email already exist
  const existUser = await User.findOne({ where: { email } });
  if (existUser) {
    throw new AppError("User already exists.", 401);
  }

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });
  // 2. create token
  const token = newUser.generateToken();

  newUser.excludePasswordField();

  // 3. send token back to client
  res.status(201).json({
    status: "success",
    token,
    newUser,
  });
});

// @desc: Login user
// @route: POST /api/users/login/password
// @access: Private
const login = asyncHandler(async (req, res, next) => {
  // 1. read email , password from req.body
  const { email, password } = req.body;
  // 2. check if email, password exist
  if (!email || !password) {
    throw new AppError("Please provide email and password!", 400);
  }
  // 3. log user in
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        messsage: info,
        user: user,
      });
    }

    // login user
    req.login(user, { session: false }, (err) => {
      if (err) {
        next(err);
      }

      // generate a signe web token with the user id and return in response
      const token = user.generateToken();
      user.excludePasswordField();
      return res.status(200).json({
        token,
        user,
      });
    });
  })(req, res, next);
});

// @desc: Check user is login before accessing private resources
// @route: -
// @access: Private
const protect = (req, res, next) => {
  return passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) return next(err);

    // if user has logout, user = false
    if (!user) {
      throw new AppError("You are not logged in yet, please login first.", 401);
    }
    // grant access
    req.user = user;
    next();
  })(req, res, next);
};

// @desc: logout user by send back an invalid token
// @route: /api/users/logout
// @access: Private
const logout = (req, res, next) => {
  res.status(200).json({
    token: "logout",
    message: "You have logout successfully.",
  });
};

// @desc: check if a certain user is allowed to access a certain resource, even if user is logged in.
// @route: -
// @access: Private
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(
        "You do not have permission to perform this action",
        403
      );
    }
    next();
  };
};

// @desc: send resetPassword url to user's email inbox
// @route: POST /api/users/forgotPassword
// @access: Private
const forgetPassword = asyncHandler(async (req, res, next) => {
  // find the user
  const user = await User.findOne({
    where: {
      email: req.body.email,
    },
  });
  if (!user) {
    throw new AppError("There is no user with email address.", 404);
  }

  const resetToken = user.createPasswordResetToken();
  await user.save();

  // send resetToken to email
  // 1. url to reset password
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/users/resetPassword/${resetToken}`;

  const message = `  You're receiving this e-mail because you or someone else has requested a password reset for your user account at .\n\n
  Click the link below to reset your password: ${resetURL}\n\n
  If you did not request a password reset you can safely ignore this email.
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    // send response to end up request-response cycle
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    // what do when there is error at sendEmial -> reset both the token and the expire property

    // reset token : modify & save to db
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    throw new AppError(
      "There was an error sending the email. Try again later!",
      500
    );
  }
});

// @desc: send resetPassword url to user's email inbox
// @route: POST /api/users/forgotPassword
// @access: Private
const resetPassword = asyncHandler(async (req, res, next) => {
  // find user by passwordResetToken
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    where: {
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: {
        [Sequelize.Op.gt]: Date.now(),
      },
    },
  });

  if (!user) {
    // if token has expired
    throw new AppError("Token is invalid or has expired", 400);
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // exclude field related to password
  user.excludePasswordField();

  res.status(200).json({
    status: "success",
    token: user.generateToken(),
    data: {
      user,
    },
  });
});

module.exports = {
  signup,
  login,
  protect,
  logout,
  restrictTo,
  forgetPassword,
  resetPassword,
};
