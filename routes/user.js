const express = require('express');
const router = express.Router();
const UserController = require('../app/controllers/UserController')
const validator = require('../app/middlewares/validator')

// LOGIN
router.get('/login',validator.ensureAuthenticated, UserController.login)
router.post('/login', validator.validateLogin() , UserController.processLogin)

// REGISTER
router.get('/register',validator.ensureAuthenticated, UserController.register)
router.post('/register', validator.validateRegister(), UserController.processRegister)

// LOGOUT
router.post('/logout', UserController.logout)

// PROFILE
router.get('/', validator.isLogin, UserController.profile)

module.exports = router;
