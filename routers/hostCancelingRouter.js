const { Router } = require('express');
const { hostCancelingController } = require('../controllers/hostCancelingController');
const hostCancelingRouter = new Router();
const auth= require("../middlewares/auth");
module.exports = { hostCancelingRouter};

hostCancelingRouter.delete('/:hid' ,auth,hostCancelingController.deleteHost);