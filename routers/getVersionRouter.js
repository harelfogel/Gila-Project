const { Router } = require('express');
const { getVersionController } = require('../controllers/getVersionController');
const getVersionRouter = new Router();
module.exports = { getVersionRouter};

getVersionRouter.get('/' ,getVersionController.getVersion);



