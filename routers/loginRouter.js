const { Router } = require('express');
const { loginController } = require('../controllers/loginController');
const loginRouter = new Router();
module.exports = { loginRouter};
const Zabbix = require('zabbix-rpc');

//const z = new Zabbix(`${process.env.ZABBIX_SERVER_URL}/zabbix`);


 loginRouter.post('/' ,loginController.login);
//loginRouter.post('/' ,loginController.zabbixLogin(z,'Admin','zabbix'));