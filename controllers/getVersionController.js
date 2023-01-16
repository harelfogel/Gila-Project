
const axios = require('axios');
const { response } = require('express');

exports.getVersionController = {
    async getVersion(req, res) {
    const payload = {
        "jsonrpc": "2.0",
        "method": "apiinfo.version",
        "params": {},
        "id":1,
        "auth": null
    }
        console.log('getVersion');
    const version = await axios.post("http://192.168.23.76/zabbix/api_jsonrpc.php", payload)
    console.log({version: version.data})
        res.json({version:version.data});
    }
}