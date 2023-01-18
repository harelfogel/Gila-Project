const axios = require("axios");
module.exports = async (req, res, next) => {
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
    if (auth) {
        const createHostParams={
            authToken:auth,
            port:"10050",
            hostName:"Test-TBD-4",
            groups: [
                {
                  groupid: "2",
                },
              ]
        }
      req.data =createHostParams;
    } else {
      res.status(401).json({ message: `Bad Token.Cannot login to Zabbix.` });
    }
    next();
  } catch (err) {
    res.status(404).json({ message: `Cannot login to Zabbix.` });
  }
};
