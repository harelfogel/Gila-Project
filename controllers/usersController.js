const axios = require("axios");
const { isHostExists, getAuth, stringToArray, getGroupIdByName, getAllUsersGroups, usersGroupsCorrection } = require("../utils/utils");
const { addStat } = require("../utils/stats");

const userGroupNameToId = async ({ auth, userGroupName }) => {
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
      method: "usergroup.get",
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
    const groupNamesListNames = groupNamesList.map((element) => { return { name: element.name, usrgrpid: element.usrgrpid } });
    return desiredGroupId.groupid
  } catch (err) {
    addStat("requestError");
    console.log(err);
    return err;
  }
};

exports.usersController = {

  async createUser({ params }) {
    try {
      const auth = await getAuth();
      console.log(params);
      let username = params.user_name;
      username=username.toLowerCase();
      let password = params.password;
      console.log(password)
      password = password.split(" ").join("");
      if ((password.length) < 8) {
        throw `The password is too short`;
      }
      if (!password) {
        throw `Invalid password`;
      }
      let usrgrps = usersGroupsCorrection(params.user_group);
      const surName = usrgrps;
      usrgrps = stringToArray(usrgrps);
      const allUsers = await this.getAllUsers();
      const isUserExists = allUsers.filter(user => user.username === allUsers);
      if (isUserExists.length) {
        throw `User is already exists`;
      }
      const allUserGroups = await getAllUsersGroups(auth);
      const allIds = await this.getUserGroupIdByName(auth, allUserGroups);
      const reqIds = await this.getUserGroupIdByName(auth, usrgrps);
      const usergroupsIdsArray = reqIds.map(userGroupId => userGroupId.usrgrpid);
      const allGroupdIdArray = allIds.map(allUserGroupsIds => allUserGroupsIds.usrgrpid);
      let flag = 1;
      if (isHostExists(usergroupsIdsArray, allGroupdIdArray) === false) {
        throw `User group is not exists`;
      }

      console.log(usergroupsIdsArray)
      const payload = {
        jsonrpc: "2.0",
        method: "user.create",
        params: {
          username: username,
          passwd: password,
          surname: surName,
          roleid: "1",
          usrgrps: [
            {
              usrgrpid: usergroupsIdsArray[0]
            }
          ],
        },
        auth: auth,
        id: 1
      }
      const res = await axios.post(
        `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
        payload
      );

      if (!res) {
        throw 'Cannot create user';
      }
      if (!('error' in res.data)) {
        flag = 1;
      }
      else if (res.data.error.code === -32602) {  // if the user is already exists
        flag = 0;
        throw `${(res.data.error.data).split(":").pop()}`;
      }

      if (flag) {
        return {
          status: true,
          message: `User is Created Succesfully.`
        }

      }
    }

    catch (err) {
      addStat("requestError");
      return {
        status: false,
        message: `Cannot create user:${err}`
      }
    }
  },
  async getUserGroupIdByName(auth, userGroupsNamesList) {
    try {
      if (!auth) {
        throw "Bad Token";
      }
      if (!userGroupsNamesList) {
        throw "Cannot Find names list for getting template id";
      }
      const userGroupdsPayload = {
        jsonrpc: "2.0",
        method: "usergroup.get",
        params: {
          filter: {
            name: userGroupsNamesList
          },
          output: "extend",
          status: 0
        },
        auth,
        id: 1
      };
      const response = await axios.post(
        `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
        userGroupdsPayload
      );
      const userGroupsIds = response.data.result.map(item => {
        return {
          name: item.name,
          usrgrpid: item.usrgrpid
        }
      })
      return userGroupsIds;
    } catch (err) {
      addStat("requestError");
      console.log(err);
      return err;
    }
  },
  async deleteUser({ params }) {
    try {
      const auth = await getAuth();
      let username = params.user_name;
      username=username.toLowerCase();
      username = username.split(" ").join("");
      const allUsers = await this.getAllUsers();
      const reqIds = await this.getUsersIdsByName(username, auth);
      if (!reqIds) {
        throw `Cannot find user name: ${username}`;
      }
      else if((reqIds[0].userid)=== undefined){
        throw `User is not exists`;
      }
      const retUserId = reqIds[0].userid;
      console.log({retUserId});
      const payload = {
        jsonrpc: "2.0",
        method: "user.delete",
        params: {
          retUserId
        },
        auth: auth,
        id: 1
      }
      const res = await axios.post(
        `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
        payload
      );

      if (!res) {
        throw 'Cannot delete user';
      }
      console.log(res);

      return {
        status: true,
        message: `User ${username} is deleted Succesfully.`
      }

    } catch (err) {
      return {
        status: false,
        message: `Cannot delete username that is ${params.username}: ${err}`
      }
    }
  },

  async getAllUsers() {
    try {
      const auth = await getAuth();
      const getAllUsersPayload = {
        jsonrpc: "2.0",
        method: "user.get",
        params: {
          output: "extend",
        },
        auth,
        id: 1,
      };

      const response = await axios.post(
        `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
        getAllUsersPayload
      );
      let users = response.data.result;
      if (!users) {
        throw `Empty Users List`;
      }
      const usersObjets = users.map(user => {
        return {
          userid: user.userid,
          username: user.username,
          name: user.name,
          roleid: user.roleid
        }
      })
      return usersObjets;
    } catch (err) {
      return `Can't Get all users:${err}`;
    }
  },

  async getUsersIdsByName(usersNamesList, auth) {
    try {
      if (!usersNamesList) {
        throw "User name is not exists";
      }
      const getUsersIdsPayload = {
        jsonrpc: "2.0",
        method: "user.get",
        params: {
          filter: {
            username: usersNamesList
          }
        },
        auth,
        id: 1,
      };
      const response = await axios.post(
        `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
        getUsersIdsPayload
      );
      const usersIdsObjects = response.data.result.map(user => {
        return {
          userid: user.userid
        }
      })

      console.log({usersIdsObjects});
      if (!usersIdsObjects || usersIdsObjects == []) {
        throw `User is not exists`
      }
      return usersIdsObjects;
    } catch (err) {
      return undefined;
    }
  }
}