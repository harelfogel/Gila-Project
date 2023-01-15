const { Router } = require('express');
const { hostCancelingController } = require('../controllers/hostCancelingController');
const hostCancelingRouter = new Router();
module.exports = { hostCancelingRouter};

hostCancelingRouter.delete('/:hid' ,hostCancelingController.deleteHost);