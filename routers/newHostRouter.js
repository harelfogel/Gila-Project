const { Router } = require('express');
const { newHostController } = require('../controllers/newHostController');
const newHostRouter = new Router();
module.exports = { newHostRouter};

newHostRouter.post('/' ,newHostController.createHost);