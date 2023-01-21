const { getHostIdByName } = require("./utils");

const getCreateHostParams = ({
  auth,
  req,
  port = "10050",
}) => {
  try {
    const body = req.body;
    const groupid = req.body.host_groups
    const params = {
      // authToken: auth,
      port: port,
      ip: body.params.host_ip,
      hostName: body.params.host_name,
      groups: [
        {
          groupid: [groupid],
        },
      ],
    };
    console.log({yovell:params})
    return params
  } catch (err) {
    return err;
  }
};

const getDeleteHostParams = async (
  auth,
  hostname = "Test-TBD-10",
  hostId = "2"
) => {
  try {
    hostId = await getHostIdByName("Test-TBD-10");
    console.log(hostId);
    const params = {
      authToken: auth,
      hostName: hostname,
      params: [hostId],
    };
    return params;
  } catch (err) {
    return err;
  }
};

const getProblemsParams = (auth, hostIds = "10084") => {
  try {
    const params = {
      params: {
        hostids: hostIds,
        output: ["eventid", "name", "severity"],
      },
      authToken: auth,
    };
    return params;
  } catch (err) {
    return err;
  }
};

module.exports = {
  getCreateHostParams,
  getDeleteHostParams,
  getProblemsParams,
};
