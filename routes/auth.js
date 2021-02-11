const express = require("express");

const authController = require("../controllers/auth");
const {check} = require("express-validator/check")

const router = express.Router();

router.get("/login", authController.getLogin);

router.post("/login", authController.postLogin);

router.get("/reset", authController.getReset);

router.get("/signup", authController.getSignup);

router.post("/signup",check('email').isEmail().withMessage("Please enter a valid email."), authController.postSignup);

router.post("/logout", authController.postLogout);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;