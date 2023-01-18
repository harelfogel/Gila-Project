const axios = require("axios");

exports.hostController = {
  async createHost(req, res) {
    try {
      const middlewarepayload = req.data;
      const createHostPayload = {
        jsonrpc: "2.0",
        method: "host.create",
        params: {
          host: middlewarepayload.hostName,
          interfaces: [
            {
              type: 1,
              main: 1,
              useip: 1,
              ip: `${process.env.ZABBIX_SERVER_IP}`,
              dns: "",
              port: middlewarepayload.port,
            },
          ],
          groups: middlewarepayload.groups,
          tags: [
            {
              tag: "Host name",
              value: "Linux server",
            },
          ],
        },
        auth: middlewarepayload.authToken,
        id: 1,
      };
      const response = await axios.post(
        `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
        createHostPayload
      );
      res.json({ message: "Creating Host have done succecsully." });
    } catch (err) {
      res.status(404).json({ message: `Cant create Host:  ${err}` });
      console.log(err);
    }
  },
  async deleteHost(req, res) {
    try {
      const middlewarePayload = req.data;
      const deletePayload = {
        jsonrpc: "2.0",
        method: "host.delete",
        params: middlewarePayload.params,
        auth: middlewarePayload.authToken,
        id: 1,
      };
      const response = await axios.post(
        `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
        deletePayload
      );
      res.json({
        message: `Host ${middlewarePayload.params} has been deleted`,
      });
    } catch (error) {
      console.log(err);
    }
  },
  async getAllProblems(req, res) {
    try {
      const middlewareProblemsPayload = req.data;
      const problemsPayload=
        {
        jsonrpc: "2.0",
        method: "problem.get",
        params: middlewareProblemsPayload.params,
        auth: middlewareProblemsPayload.authToken,
        id: 1
        }
        const response  = await axios.post(
          `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
          problemsPayload
        );
        res.json({
          message: `${response.data.result}`
        });
      //   res.json({ message: `${auth}` });
    } catch (err) {
      res.status(404).json({ message: `Cannot get all problems: ${err}` });
    }
  },
};
