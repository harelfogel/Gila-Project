const axios = require("axios");

exports.hostController = {
    async createHost(req, res) {
        try {
          const auth = req.data;
          const createHostPayload = {
            jsonrpc: "2.0",
            method: "host.create",
            params: {
              host: "Linux server-TEST-3",
              interfaces: [
                {
                  type: 1,
                  main: 1,
                  useip: 1,
                  ip: `${process.env.ZABBIX_SERVER_IP}`,
                  dns: "",
                  port: "10050",
                },
              ],
              groups: [
                {
                  groupid: "6",
                },
              ],
              tags: [
                {
                  tag: "Host name",
                  value: "Linux server",
                },
              ],
            },
            auth: auth,
            id: 1,
          };
          res.send("create")
    
        //   const response = await axios.post(
        //     `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
        //     createHostPayload
        //   );
        //   res.json({ message: "Creating Host have done succecsully." });
        } 
        
        catch (err) {
          res.status(404).json({ message: "Bad request" });
        }
      },
      async deleteHost(req,res) {
        console.log("Delete")
        res.send("delete host")
      },
      async getAllProblems(req, res) {
        try {
          const auth= req.data;
          console.log("get all problems");
          console.log(req.data);
          res.send("problems")
        //   res.json({ message: `${auth}` });
        } catch (err) {
            res.status(404).json({ message: "Cannot get all problems" });
        }
      },
}