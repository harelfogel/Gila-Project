const axios = require("axios");

const replaceSpacesWithUnderScore = (str) => {
  try {
    if (str && typeof str === "string") {
      const replaced = str.split(" ").join("_");
      return replaced;
    } else {
      throw `Bad String`;
    }
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

const stringToArray = (str) => {
  try {
    if (str) {
      let res = str.split(",");
      return res;
    } else {
      throw `Bad zabbix name`;
    }
  } catch (error) {
    return error;
  }
};

const getAllHosts = async (auth) => {
  try {
    const getAllHostPayload = {
      jsonrpc: "2.0",
      method: "host.get",
      params: {
        output: "extend",
      },
      auth,
      id: 1,
    };

    const response = await axios.post(
      `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
      getAllHostPayload
    );
    let hostsObject = response.data.result;
    if (!hostsObject) {
      throw `Empty Host List`;
    }
    let hostsList = hostsObject.map((element) => element.name);
    return hostsList;
  } catch (err) {
    return err;
  }
};

const isHostExists = async (auth, hostName) => {
  try {
    if (!auth) {
      throw `Bad auth Token`;
    }

    let hostList = await getAllHosts(auth);
    return hostList.includes(hostName);
  } catch (err) {
    return err;
  }
};

const getAuth = async () => {
  try {
    const payload = {
      jsonrpc: "2.0",
      method: "user.login",
      params: {
        user: 'Admin',
        password: 'zabbix',
      },
      id: 2,
      auth: null,
    };
    const response = await axios.post(
      `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
      payload
    );
    return response.data.result;
  }
  catch (err) {
    return `Can't get auth: ${err}`;
  }
}

const getHostIdByName = async (
  auth,
  hostNamesList
) => {
  try {
    if (!auth) {
      throw "Bad Token";
    }
    if (!hostNamesList) {
      throw "Cannot Find nameList for getting Host Id";
    }
    const getHostIdPayload = {
      jsonrpc: "2.0",
      method: "host.get",
      params: {
        filter: {
          host: hostNamesList
        }
      },
      auth,
      id: 1,
    };
    const response = await axios.post(
      `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
      getHostIdPayload
    );
    const hostsIds = response.data.result.map(item => {
      return {
        name: item.name,
        hostid: item.hostid
      }
    })
    return hostsIds;
  } catch (err) {
    console.log(err);
    return err;
  }
};



const getHostNameById = async (
  auth,
  hostIdList
) => {
  try {
    console.log(hostIdList);
    if (!auth) {
      throw "Bad Token";
    }
    if (!hostIdList) {
      throw "Cannot Find host ids for getting Host name";
    }
    const getHostNamePayload = {
      jsonrpc: "2.0",
      method: "host.get",
      params: {
        filter: {
          host: hostIdList
        }
      },
      auth,
      id: 1,
    };
    const response = await axios.post(
      `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
      getHostNamePayload
    );
    const hostsNames = response.data.result.map(item => {
      return {
        name: item.name,
        hostid: item.hostid
      }
    })
    return hostsNames.name;
  } catch (err) {
    console.log(err);
    return err;
  }
};

const getGroupIdByName = async ({ auth, namesList }) => {
  try {
    if (!auth) {
      console.log("Auth is not defined" + auth);
      throw "Bad Token";
    }
    if (!namesList) {
      throw "Cannot Find nameList for getting Group Id";
    }
    const getGroupIdPayload = {
      jsonrpc: "2.0",
      method: "hostgroup.get",
      params: {
        output: "extend",
        filter: {
          name: namesList,
        },
      },
      auth: auth,
      id: 1,
    };
    const response = await axios.post(
      `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
      getGroupIdPayload
    );
    const groupNamesList = response.data.result;
    const groupNamesListNames = groupNamesList.map((element) => { return { name: element.name, groupid: element.groupid } });
    return groupNamesListNames

  } catch (err) {
    console.log(err);
    return err;
  }
};

const getAllTemplates = async (auth) => {
  try {
    const getAllTemplatesPayload = {
      jsonrpc: "2.0",
      method: "template.get",
      params: {
        output: "extend",
      },
      auth,
      id: 1,
    };

    const response = await axios.post(
      `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
      getAllTemplatesPayload
    );
    let templatesObject = response.data.result;
    if (!templatesObject) {
      throw `Empty Template List`;
    }
    let templatesList = templatesObject.map((element) => element.name);
    return templatesList;
  } catch (err) {
    return err;
  }
}

const isHostIdExists = (containArr, contaniableArr) => {
  const iscontainsAll = contaniableArr.every(element => {  //contaniableArr- should be smaller array , containArr-should be larger array
    return containArr.includes(element);
  });

  return iscontainsAll;
}

const isValidIpAddress = (ip) => {
  const regexExp = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gi;
  return regexExp.test(ip); // true
}


const getTemplateIdByName = async (
  auth,
  templateNamesList
) => {
  try {
    console.log(auth);
    if (!auth) {
      throw "Bad Token";
    }
    if (!templateNamesList) {
      throw "Cannot Find names list for getting template id";
    }
    const getTemplateIdPayload = {
      jsonrpc: "2.0",
      method: "template.get",
      params: {
        output: "extend",
        filter: {
          host: templateNamesList
        }
      },
      auth,
      id: 1,
    };
    const response = await axios.post(
      `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
      getTemplateIdPayload
    );
    const templatesIds = response.data.result.map(item => {
      return {
        name: item.name,
        templateid: item.templateid
      }
    })
    return templatesIds;
  } catch (err) {
    console.log(err);
    return err;
  }
};

const getSeverityNameById = (severityId) => {
  let severityName = '';
  switch (severityId) {
    case '0':
      severityName = 'Not classified';
      break;
    case '1':
      severityName = 'Information';
      break;
    case '2':
      severityName = 'Warning';
      break;
    case '3':
      severityName = 'Average';
      break;
    case '4':
      severityName = 'High';
      break;
    case '5':
      severityName = 'Disaster';
      break;

    default:
      severityName = 'Warning';
      break;
  }
  return severityName;
}


const cleanStringFromChars=(str)=>{
  let sanitizationRetProblems= str.split('[').join('');
  sanitizationRetProblems=sanitizationRetProblems.split(']').join('');
  sanitizationRetProblems=str.split('"').join('');  
  return sanitizationRetProblems;
}



module.exports = {
  replaceSpacesWithUnderScore,
  stringToArray,
  getGroupIdByName,
  getHostIdByName,
  getAllHosts,
  isHostExists,
  getAuth,
  isHostIdExists,
  isValidIpAddress,
  getAllTemplates,
  getTemplateIdByName,
  getSeverityNameById,
  getHostNameById,
  cleanStringFromChars
};




// const getHostIdByName = async (
//   auth,
//   hostNamesList = ["Zabbix servers", "Linux servers"],
//   desiredName
// ) => {
//   try {
//     let retHostId = "";
//     let isHostIdFound = false;
//     if (!auth) {
//       throw "Bad Token";
//     }
//     if (!hostNamesList) {
//       throw "Cannot Find nameList for getting Group Id";
//     }
//     const getHostIdPayload = {
//       jsonrpc: "2.0",
//       method: "host.get",
//       auth: auth,
//       id: 1,
//     };
//     const response = await axios.post(
//       `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
//       getHostIdPayload
//     );
//     const NamesList = response.data.result;
//     console.log(NamesList);
//     NamesList.forEach((element) => {
//       if (element.name === desiredName) {
//         isHostIdFound = true;
//         retHostId = element.hostid;
//       }
//     });
//     if (!isHostIdFound) {
//       throw "Cannot find host id for host";
//     }
//     return retHostId;
//   } catch (err) {
//     console.log(err);
//     return err;
//   }
// };