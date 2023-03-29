const axios = require("axios");
const _ = require('lodash');

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

const getAllProblemsByHostName = async (hostName = 'Zabbix server') => {
  try {
    const auth = await getAuth();
    //const hostName = 'Zabbix server';
    //const hostName = params.host_name;
    const allHosts = await getAllHosts(auth);
    const allHostsIds = await getHostIdByName(auth, allHosts);
    const host = allHostsIds.filter(({ name }) => name === hostName);
    const { hostid } = host[0];
    const payload = {
      jsonrpc: '2.0',
      method: 'problem.get',
      params: {
        hostids: [hostid],
        output: 'extend'
      },
      auth: auth,
      id: 1
    }

    const response = await axios.post(
      `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
      payload
    );
    const problems = _.get(response, 'data.result', []);
    return problems
  }
  catch (err) {
    console.log(err)
  }
}

const getProblemIdByName = (problems, _name) => {
  const problem = problems.filter(({ name }) => name === _name);
  const { eventid } = problem[0];
  return eventid;
}

const stringToArray = (str) => {
  try {
    if (str) {
      let res = str.split(", ");
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
    if (!hostsIds.length) {
      throw "host was not found"
    }
    console.log({ hostsIds })
    return hostsIds;
  } catch (err) {
    console.log(err);
    return [];
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

const sevirityMap = {
  '0': 'Not classifie',
  '1': 'Information',
  '2': 'Warning',
  '3': 'Average',
  '4': 'High',
  '5': 'Disaster',

}


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

const cleanStringFromChars = (str) => {
  const removeChars = ['[', ']', '"', '{', '}'];
  removeChars.forEach(charElem => str = str.split(charElem).join(''));
  return str;
}


const listAllClosableTriggers = async ( params ) => {
  try {
    const auth = await getAuth();
    console.log({params:params});
   const hostName= _.get(params, 'host_name');
   console.log({hostName:hostName});
    const allHosts = await getAllHosts(auth);
    const allHostsIds = await getHostIdByName(auth, allHosts);
    const host = allHostsIds.filter(({ name }) => name === hostName);
    console.log(host);
    const { hostid } = host[0];
    const payload = {
      jsonrpc: "2.0",
      method: "trigger.get",
      params: {
        hostids: hostid,
        output: "extend",
        selectFunctions: "extend"
      },
      auth,
      id: 1
    }
    const response = await axios.post(
      `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
      payload
    );
    const triggers = _.get(response, 'data.result', []);
    const triggersObjets = triggers.map(trigger => {
      return {
        triggerid: trigger.triggerid,
        description: trigger.description,
        templateid: trigger.templateid,
        manual_close: trigger.manual_close,
        expression: trigger.expression
      }
    })
    if (!triggersObjets.length) {
      throw `Empty Triggers list`;
    }
    const closableTriggers = triggersObjets.filter(trigger => trigger.manual_close === "1");
    return closableTriggers;
  }
  catch (err) {
    return `Cannot List all triggers: ${err}`;
  }
}

const getHostByName = async (auth, hostName) => {
  try {
    let payload = {
      jsonrpc: "2.0",
      method: "host.get",
      params: {
        output: "extend",
        filter: {
          host: hostName
        }
      },
      auth,
      id: 1
    }
    let response = await axios.post(
      `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
      payload
    );
    const host = _.get(response, 'data.result[0]', null);
    if (host) {
      // get all host's groups names
      payload = {
        jsonrpc: "2.0",
        method: "hostgroup.get",
        params: {
          output: "extend",
          hostids: host.hostid
        },
        auth,
        id: 1
      }
      response = await axios.post(
        `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
        payload
      );
      console.log(response.data.result)
      const groups = _.get(response, 'data.result', []).map(item => item.name);
      host.groups = groups;
      // get all host's templates names
      payload = {
        jsonrpc: "2.0",
        method: "template.get",
        params: {
          output: "extend",
          hostids: host.hostid
        },
        auth,
        id: 1
      }
      response = await axios.post(
        `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
        payload
      );
      console.log(response.data.result)
      const templates = _.get(response, 'data.result', []).map(item => item.name);
      host.templates = templates;
    }
    return host;
  }
  catch (err) {
    return null
  }
}


const getAllUsersGroups = async (auth) => {
  try {
    if (!auth) {
      throw `Invalid token`;
    }

    const userGroupsIdPayload = {
      jsonrpc: "2.0",
      method: "usergroup.get",
      params: {
        output: "extend",
        status: 0
      },
      auth: auth,
      id: 1
    }
    const response = await axios.post(
      `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
      userGroupsIdPayload
    );
    let userGroups = response.data.result;
    if (!userGroups) {
      throw `Empty Template List`;
    }
    let userGroupsList = userGroups.map((element) => element.name);
    return userGroupsList;

  } catch (err) {
    return err;
  }
}


const usersGroupsCorrection = (userGroupName) => {
  try {
    const accurateUserGruopName = ['Zabbix administrators', 'Guests', 'Enabled debug mode', 'No access to the frontend']
    if (!userGroupName) {
      throw `Bad User group`;
    }

    if (userGroupName.startsWith('za') || userGroupName.startsWith('Za') || userGroupName.startsWith('zab') || userGroupName.startsWith('Zab')) {
      userGroupName = accurateUserGruopName[0];
    }

    else if (userGroupName.startsWith('Gu') || userGroupName.startsWith('gu') || userGroupName.startsWith('g') || userGroupName.startsWith('G')) {
      userGroupName = accurateUserGruopName[1];
    }

    else if (userGroupName.startsWith('En') || userGroupName.startsWith('en') || userGroupName.startsWith('e') || userGroupName.startsWith('E')) {
      userGroupName = accurateUserGruopName[2];
    }

    else if (userGroupName.startsWith('No') || userGroupName.startsWith('no')) {
      userGroupName = accurateUserGruopName[3];
    }
    else {
      throw `Cannot find group name`;
    }
    return userGroupName;

  } catch (err) {
    return `Bad user Group Name:${err}`;
  }

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
  cleanStringFromChars,
  getProblemIdByName,
  getAllProblemsByHostName,
  listAllClosableTriggers,
  getHostByName,
  sevirityMap,
  getAllUsersGroups,
  usersGroupsCorrection
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