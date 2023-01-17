const { Router } = require('express');
const { hostController } = require('../controllers/hostController');
const hostRouter = new Router();
const auth = require("../middlewares/auth");
module.exports = { hostRouter };

hostRouter.post('/', auth, hostController.createHost);
hostRouter.delete('/', auth, hostController.deleteHost);
hostRouter.get('/', auth, hostController.getAllProblems);

