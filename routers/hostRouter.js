const { Router } = require('express');
const { hostController } = require('../controllers/hostController');
const hostRouter = new Router();
const createMiddleware= require("../middlewares/createMiddleware");
const deleteMiddleware= require("../middlewares/deleteMiddleware");
const problemsMiddlleware = require("../middlewares/problemsMiddlleware");
module.exports = { hostRouter};

hostRouter.post('/' ,createMiddleware,hostController.createHost);
hostRouter.delete('/' ,deleteMiddleware,hostController.deleteHost);
hostRouter.get('/' ,problemsMiddlleware,hostController.getAllProblems);
