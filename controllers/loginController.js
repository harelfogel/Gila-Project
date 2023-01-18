const axios = require("axios");
const Zabbix = require('zabbix-rpc');

exports.loginController = {
  async login(req, res) {
    try {
      const payload = {
        jsonrpc: "2.0",
        method: "user.login",
        params: {
          user: "Admin",
          password: "zabbix",
        },
        id: 2,
        auth: null,
      };
      const response = await axios.post(
        `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
        payload
      );
      const auth = response.data.result;
      res.json({ response: response.data });
    } catch (err) {
      res.status(401).json({ mesaage: `Bad Token. Cannot login to Zabbix.` });
    }
  },
  // async zabbixLogin(username,password){

  // }
  
};
