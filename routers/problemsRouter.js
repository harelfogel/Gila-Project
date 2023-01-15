const { Router } = require('express');
const { problemsController } = require('../controllers/problemsController');
const problemsRouter = new Router();
module.exports = { problemsRouter};

problemsRouter.get('/' ,problemsController.getAllProblems);