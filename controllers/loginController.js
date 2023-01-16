
const axios = require('axios');
const { response } = require('express');

exports.loginController = {
    async login(req, res) {
    const payload = {
        "jsonrpc": "2.0",
        "method": "user.login",
        "params": {
            "user": "Admin",
            "password": "zabbix"
        },
        "id":2,
        "auth": null
    }
    console.log('login');
    const response = await axios.post("http://192.168.23.76/zabbix/api_jsonrpc.php", payload)
    const auth = response.data.result;
    console.log({auth})
    res.json({response:response.data});
    }
}