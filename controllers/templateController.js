const axios = require("axios");

exports.templateController = {
    async createTemplate(req, res) {
        try {
            const middlewarepayload = req.data;
            console.log("inm in template conroller");
            console.log(middlewarepayload);

            const createtemplatePayload = {
                jsonrpc: "2.0",
                method: "template.create",
                params: {
                    host: middlewarepayload.hostName,
                    // template: middlewarepayload.templateName,
                    templates: [{
                        templateid: middlewarepayload.templateid,
                    }, ],
                    groups: middlewarepayload.groups,
                    tags: [{
                        tag: "Host name",
                        value: "Linux server",
                    }, ],
                },

                auth: middlewarepayload.authToken,
                id: 1,
            };

            const response = await axios.post(
                `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
                createtemplatePayload
            );
            res.json({ message: "Creating template have done succecsully." });
        } catch (err) {
            res.status(404).json({ message: `Cant create template:  ${err}` });
            console.log(err);
        }
    },
    async getAllItem(req, res) {
        try {
            const middlewareItemsPayload = req.data;
            const itemsPayload = {
                jsonrpc: "2.0",
                method: "item.get",
                params: middlewareItemsPayload.params,
                auth: middlewareItemsPayload.authToken,
                id: 1,
            };
            const response = await axios.post(
                `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
                itemsPayload
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
    async getTrend(req, res) {
        try {
            const middlewareItemsPayload = req.data;
            const trendPayload = {
                jsonrpc: "2.0",
                method: "trend.get",
                params: middlewareItemsPayload.params,
                auth: middlewareItemsPayload.authToken,
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