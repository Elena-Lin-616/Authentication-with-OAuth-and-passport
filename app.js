const express = require("express");
const morgan = require("morgan");
// const session = require("express-session");
// const passport = require("passport");
const app = express();
require("./services/passport/local");
require("./services/passport/jwt");

const {
  notFound,
  glbalErrorHandler,
} = require("./controllers/errorController");

app.use(morgan("dev"));
app.use(express.json());

// app.use(
//   session({
//     secret: process.env.JWT_SECRET,
//     resave: false,
//     saveUninitialized: false,
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());

// @desc Test route
app.get("/test", (req, res) => {
  res.send("APP for Learning Auth");
});

// @desc: router for users and prducts
app.use("/api/users", require("./routes/userRouter"));
app.use("/api/products", require("./routes/productRouter"));

app.use(notFound);

app.use(glbalErrorHandler);

module.exports = app;
