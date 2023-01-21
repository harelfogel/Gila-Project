const axios = require("axios");
const { isHostExists,getGoogleResponse, getAuth, stringToArray, getGroupIdByName } = require("../utils/utils");


const userGroupNameToId = async ({auth, userGroupName}) => {
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
    console.log(err);
    return err;
  }
};

exports.userController = {

    async createUser({params}) {
        console.log({params})
        try{
          const auth = await getAuth();
          console.log({auth})
          const username = params.user_name;
          const password = params.password;
          const usrgrps = stringToArray(params.user_group)

          const groupsIds = ['Guests']
          groupList.map(async item => {
            const groupId = await getGroupIdByName({
              auth,
              namesList: groupuserList,
              desiredName: item
            })
            groupsIds.push({groupid: ['Guests']})
          })
    
    
          const payload = {
            jsonrpc: "2.0",
            method: "user.create",
            params:{
              username: username,
              passwd: password,
              roleid: "1",
              usrgrps: usrgrps
            },
            auth: auth,
            id: 1
          }
    
          await axios.post(
            `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
            payload
          );
    
          return {
            status: true,
            message: "You finally succeed you mother fucker"
          }
        }
        catch(err){
          console.log(err)
        }
      },


}