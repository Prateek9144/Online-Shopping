const User = require("../models/user");

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator/check");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              return res.redirect("/");
            });
          }
          req.flash("error", "Invalid email or password");
          return res.redirect("/login");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("errorMessage");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  console.log(message);
  console.log(req.session.inLoggedIn);
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Sign Up",
    errorMessage: message,
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    console.log(error);
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Sign Up",
      errorMessage: error.array()[0].msg,
    });
  }
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash(
          "errorMessage",
          "E-mail already exist, pick a diffrenet one."
        );
        return res.redirect("/signup");
      } else if (email.length <= 0) {
        req.flash("errorMessage", "Email address must be filled out. ");
        return res.redirect("/signup");
      } else if (password.length <= 0) {
        req.flash("errorMessage", "Password field is empty.");
        return res.redirect("/signup");
      } else if (confirmPassword != password) {
        req.flash(
          "errorMessage",
          "Entered password and confirm password won't match, please try again!"
        );
        return res.redirect("/signup");
      }
      return bcrypt.hash(password, 12).then((bcryptPassword) => {
        const newUser = new User({
          email: email,
          password: bcryptPassword,
          cart: { items: [] },
        });
        return newUser.save();
      });
    })
    .then((result) => {
      res.redirect("/login");
      return transporter.sendMail({
        to: email,
        from: "prateekchouhan00@gmail.com",
        subject: "Signup Successful!",
        html: `<h1  style="color:blue;"> Welcome to Door Store! </h1><h3>You Successfully signed up to Door Store!</h3>`,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  console.log("Reset Password");
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  const email = req.body.email;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account found with this email.");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpire = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        transporter.sendMail({
          to: email,
          from: "prateekchouhan00@gmail.com",
          subject: "Reset my password",
          html: `<h1>Hello!</h1>
					<p>We received a request to reset your Door store account password. Click the link below to choose a new one:</p>
					<p><a href="http://localhost:8000/reset/${token}">Reset my password</a></p>`,
        });
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("errorMessage");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "Update Password",
        errorMessage: message,
        userId: user._id,
        userEmail: user.email,
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  newPassword = req.body.password;
  userId = req.body.userId;
  token = req.body.passwordToken;
  let resetUser;
  User.findOne({
    _id: userId,
    resetToken: token,
    resetTokenExpire: { $gt: Date.now() },
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashpaword) => {
      resetUser.password = hashpaword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpire = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
    });
};
