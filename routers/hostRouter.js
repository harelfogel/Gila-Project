const { Router } = require('express');
const { hostController } = require('../controllers/hostController');
const hostRouter = new Router();

const middleware= require("../middlewares/middleware");
module.exports = { hostRouter};

hostRouter.post('/' ,middleware,hostController.createHost);
hostRouter.delete('/' ,middleware,hostController.deleteHost);
hostRouter.get('/' ,middleware,hostController.getAllProblems);
hostRouter.get('/helathcheck' ,middleware,hostController.getHealthCheck);

