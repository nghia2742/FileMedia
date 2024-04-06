const { body } = require("express-validator");
const User = require("../models/User");
const express = require('express');
const app = express();

module.exports.validateRegister = function () {
  return [
    body("name").notEmpty().withMessage("Tên không được để trống"),
    body("email")
      .exists()
      .withMessage("Email đã tồn tại")
      .notEmpty()
      .withMessage("Email không được để trống")
      .isEmail()
      .withMessage("Email không đúng")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(user => {
          if (user) {
            return Promise.reject('Email đã tồn tại');
          }
        });
      }),
    body("password")
      .notEmpty()
      .withMessage("Mật khẩu không được để trống")
      .isLength({ min: 6 })
      .withMessage("Mật khẩu ít nhất 6 ký tự"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Mật khẩu nhập lại không khớp");
      }
      return true;
    }),
  ];
};

module.exports.validateLogin = function () {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email không được để trống")
      .isEmail()
      .withMessage("Email không đúng"),
    body("password")
      .notEmpty()
      .withMessage("Mật khẩu không được để trống")
      .isLength({ min: 6 })
      .withMessage("Mật khẩu ít nhất 6 ký tự"),
  ];
};

module.exports.isLogin = function (req, res, next) {
    if (!req.signedCookies.UID) {
      res.redirect("/user/login");
      return;
    }
  next();
};

module.exports.ensureAuthenticated = function (req, res, next) {
  if (req.signedCookies.UID) {
    res.redirect("/");
    return;
  }
next();
};
