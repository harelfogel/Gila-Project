const { Router } = require('express');
const { problemsController } = require('../controllers/problemsController');
const problemsRouter = new Router();
const auth= require("../middlewares/auth");
module.exports = { problemsRouter};

problemsRouter.get('/' ,auth,problemsController.getAllProblems);