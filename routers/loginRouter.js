const { Router } = require('express');
const { loginController } = require('../controllers/loginController');
const loginRouter = new Router();
module.exports = { loginRouter};

loginRouter.post('/' ,loginController.login);