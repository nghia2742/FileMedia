const User = require("../models/User");
const { mongooseToObject } = require("../../util/mongoose");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

class UserController {
  //[GET] /signIn
  profile(req, res) {
    User.findOne({ _id: req.signedCookies.UID })
      .then((user) => res.render("profile", { user: mongooseToObject(user) }))
      .catch((err) => console.log(err));
  }

  //[GET] /signIn
  login(req, res) {
    res.render("login");
  }

  //[POST] /signIn
  processLogin(req, res) {
    let errors = validationResult(req);
    let formData = req.body;
    let plainPassword = formData.password;
    let saltRounds = 10;
    let msgError = errors.errors[0] ? errors.errors[0].msg : "";

    // Xuất lỗi
    if (!errors.isEmpty()) {
      req.flash("error", msgError);
      return res.render("login", {
        errorMessage: req.flash("error"),
        user: formData,
      });
    }

    User.findOne({ email: formData.email })
      .then((user) => {
        bcrypt
          .compare(plainPassword, user.password)
          .then((result) => {
            if (result) {
              // Send back cookie for client
              req.session.UID = user._id
              res.cookie("UID", user._id, {
                signed: true,
              });
              res.redirect("/");
            } else {
              req.flash("error", "Sai mật khẩu");
              return res.render("login", {
                errorMessage: req.flash("error"),
                user: formData,
              });
            }
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch(() => {
        req.flash("error", "Email không tồn tại");
        res.render("login", {
          errorMessage: req.flash("error"),
          user: formData,
        });
      });
  }

  //[GET] /signUp
  register(req, res) {
    res.render("register");
  }

  // [POST] /signUp
  processRegister(req, res, next) {
    let errors = validationResult(req);
    let formData = req.body;
    let plainPassword = formData.password;
    let saltRounds = 10;
    let msgError = errors.errors[0] ? errors.errors[0].msg : "";
    if (!errors.isEmpty()) {
      req.flash('error', msgError)
      return res.render("register", {
        errorMessage: req.flash('error'),
        user: formData,
      });
    }

    bcrypt
      .hash(plainPassword, saltRounds)
      .then((hashedPassword) => {
        formData.password = hashedPassword;
        User.create(formData)
          .then(() => {
            formData.password = plainPassword;
            req.flash('success', "Đăng ký thành công")
            res.render("register", {
              successMessage: req.flash('success'),
              user: formData,
            });
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => {
        console.error(err);
      });
  }

  //[POST] /logout
  logout(req, res, next) {
    res.cookie("UID", "", { maxAge: 0 });
    res.redirect("/user/login");
  }
}

module.exports = new UserController();
