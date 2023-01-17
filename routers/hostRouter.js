const { Router } = require('express');
const { hostController } = require('../controllers/hostController');
const hostRouter = new Router();
const auth= require("../middlewares/auth");
module.exports = { hostRouter};

hostRouter.post('/' ,hostController.createHost);
hostRouter.delete('/' ,hostController.deleteHost);
hostRouter.get('/' ,hostController.getAllProblems);

