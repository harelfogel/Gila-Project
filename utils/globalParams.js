const getCreateHostParams = (
  auth,
  hostname = "Test-TBD-5",
  groupId = "2",
  port = "10050"
) => {
  try {
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

const getDeleteHostParams = (auth, hostname = "Test-TBD-4", hostId = "2") => {
  try {
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
