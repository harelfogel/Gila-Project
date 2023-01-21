const axios = require("axios");

exports.trendController = {
    async getTrend(req, res) {
        try {
            const middlewaretrendPayload = req.data;
            const trendPayload = {
                jsonrpc: "2.0",
                method: "trend.get",
                params: middlewaretrendPayload.params,
                auth: middlewaretrendPayload.authToken,
                id: 1,
            };
            const response = await axios.post(
                `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
                trendPayload
            );
            res.json({
                message: response.data.result,
            });
            console.log(response.data.result);
            //   res.json({ message: `${auth}` });
        } catch (err) {
            res.status(404).json({ message: `Cannot get all items: ${err}` });
        }
    },
};