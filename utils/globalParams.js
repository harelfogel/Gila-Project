const { getHostIdByName } = require("./utils");

const getCreateHostParams = ({
  auth,
  hostname = "Test-TBD-10",
  groupId = "2",
  port = "10050",
  req,
}) => {
  try {
    const body= req.body;
    const params = {
      authToken: auth,
      port: port,
      hostName: hostname,
      groups: [
        {
          groupid: groupId,
        },
      ],
    };
    return params;
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
