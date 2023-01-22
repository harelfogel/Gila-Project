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

const getGoogleResponse = (hostName, resMethod) => {
  try {
    if (hostName) {
      let textToSpeech = ``;
      if (resMethod === 'create host') {
        textToSpeech = `The user ${hostName} has been created successfully`
      }
      else if (resMethod === 'delete host') {
        textToSpeech = `The user ${hostname} has been deleted succesfully`;
      }
      else if (retMethod === 'get all problems') {
        textToSpeech = `Ok. Here is all the problems:`;
      }
      const retObject = {
        expectUserResponse: true,
        expectedInputs: [
          {
            possibleIntents: [
              {
                intent: "actions.intent.TEXT"
              }
            ],
            inputPrompt: {
              richInitialPrompt: {
                items: [
                  {
                    simpleResponse: {
                      textToSpeech: textToSpeech
                    }
                  }
                ]
              }
            }
          }
        ]
      }
      return retObject;
    } else {
      throw `Invalid hostName`;
    }
  } catch (err) {
    return err;
  }
}

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
    console.log({ response: response.data })
    return response.data.result;
  }
  catch (err) {
    return `Can't get auth: ${err}`;
  }
}

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

const getHostIdByName = async (
  auth,
  hostNamesList
) => {
  try {
    if (!auth) {
      throw "Bad Token";
    }
    if (!hostNamesList) {
      throw "Cannot Find nameList for getting Group Id";
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
    const hostsIds =  response.data.result.map(item => {
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

const getGroupIdByName = async ({auth,namesList}) => {
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

// const getRequestedValues=(arr1,arr2) =>{
//   console.log('im in!!!!--------------getRequestedValues')
//   return arr1.filter(object1 =>{
//     return arr2.some(object2=>{
//       return object1.hostid===object2.hostid;
//     });
//   });
// }

module.exports = {
  replaceSpacesWithUnderScore,
  stringToArray,
  getGroupIdByName,
  getHostIdByName,
  getAllHosts,
  isHostExists,
  getGoogleResponse,
  getAuth
};
