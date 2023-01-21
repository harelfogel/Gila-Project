const axios = require("axios");
const {
  getCreateHostParams,
  getDeleteHostParams,
  getProblemsParams,
} = require("../utils/globalParams");
module.exports = async (req, res, next) => {
  try {
    // console.log("middleware", req.body)
    let responseParams = {};
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
    console.log({auth})
    if (auth && req.baseUrl === "/host" && req.method === "POST") {
      // CREATE new host
      responseParams = getCreateHostParams({req});
    } else if (auth && req.baseUrl === "/host" && req.method === "DELETE") {
      // DELETE  host
      responseParams = getDeleteHostParams({req});
    } else if (auth && req.baseUrl === "/host" && req.method === "GET") {
      // Get all problems in host
      responseParams = getProblemsParams({req});
    } else {
      throw `Route is not exist.Cannot login to Zabbix.`;
    }
    req.data = {...responseParams, auth};
    console.log("middleware", req.data)
    next();
  } catch (err) {
    res.status(401).json({ message: `${err}` });
  }
};
