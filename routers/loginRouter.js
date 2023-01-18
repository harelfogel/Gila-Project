const { Router } = require('express');
const { loginController } = require('../controllers/loginController');
const loginRouter = new Router();
module.exports = { loginRouter};
const Zabbix = require('zabbix-rpc');

loginRouter.post('/' ,loginController.login);
//loginRouter.post('/' ,loginController.zabbixLogin);