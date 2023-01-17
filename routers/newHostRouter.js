const { Router } = require('express');
const { newHostController } = require('../controllers/newHostController');
const newHostRouter = new Router();
const auth= require("../middlewares/auth");
module.exports = { newHostRouter};

newHostRouter.post('/' ,auth,newHostController.createHost);