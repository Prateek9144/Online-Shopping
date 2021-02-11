const express = require("express");

const authController = require("../controllers/auth");
const { check, body } = require("express-validator/check");
const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLogin);

router.post(
  "/login",
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .custom((value, { req }) => {
      // console.log(value);
      return User.findOne({ email: value }).then((userDoc) => {
        if (!userDoc) {
          console.log(value);
          return Promise.reject("No account with this email.");
        }
      });
    }),
  authController.postLogin
);

router.get("/reset", authController.getReset);

router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        // console.log(value);
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            console.log(value);
            return Promise.reject(
              "E-mail already exist, pick a diffrenet one."
            );
          }
        });
      }),
    body(
      "password",
      "Please use 8 or more characters in your password"
    ).isLength({ min: 8 }),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Those passwords didn’t match");
      }
      return true;
    }),
  ],
  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
