const axios = require("axios");
const { isHostExists,getGoogleResponse, getAuth, stringToArray, getGroupIdByName, getHostIdByName, getAllHosts } = require("../utils/utils");

exports.hostController = {

  async createNewHost({params}) {
    console.log({params})
    try{
      const auth = await getAuth();
      const hostName = params.host_name;
      const groupList = stringToArray(params.host_groups)
      if (await isHostExists(auth, hostName) == true){
        return {
          status: false,
          message: `${hostName} is already exist.`
        }
      }
      const tags = groupList.map(item => {
        return {
          tag: "Host Name",
          value: item
        }
      })
      const groupsIds = await getGroupIdByName({auth, namesList: groupList })
      if(groupsIds.length !== groupList.length){
        return {
          status: false,
          message: "Group name not found"}
      }
      const payload = {
        jsonrpc: "2.0",
        method: "host.create",
        params:{
          host: hostName,
          groups: groupsIds,
          tags
        },
        auth: auth,
        id: 1
      }

      const response = await axios.post(
        `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
        payload
      );
      console.log({createHostResponse: response.data.error})
      return {
        status: true,
        message: `${hostName} created successfully.`
      }
    }
    catch(err){
      console.log(err)
    }
  },

  

  async deleteHost({params}) {
    try {
      const hostNameArray = stringToArray(params.host_name);
      const auth = await getAuth();
      const allHosts = await getAllHosts(auth);
      const allIds = await getHostIdByName(auth, allHosts);
      const reqIds= await getHostIdByName(auth, hostNameArray);
      const hostIdsArray= reqIds.map(hostId=>hostId.hostid);
      const allHostIdArray=allIds.map(allHostsIds=>allHostsIds.hostid);
      console.log(hostIdsArray);
      console.log(allHostIdArray);
      const isHostsIdsExists= hostIdsArray.every(host =>{
        return allHostIdArray.includes(host);
      });

      console.log(isHostsIdsExists);
      if(isHostsIdsExists === false){
        throw `Host name is not exists`;
      }
      const payload = {
        jsonrpc: "2.0",
        method: "host.delete",
        params: hostIdsArray,
        auth,
        id: 3,
      };
      const response = await axios.post(
        `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
        payload
      );      
      return {
        status: true,
        message: `${hostNameArray} has been deleted`
      }

    } catch (error) {
      return {
        status:false,
        message:`Cannot delete: ${error}`
      };
    }
  },
  async getAllProblems(req, res) {
    try {
      const middlewareProblemsPayload = req.data;
      const problemsPayload=
        {
        jsonrpc: "2.0",
        method: "problem.get",
        params: middlewareProblemsPayload.params,
        auth: middlewareProblemsPayload.auth,
        id: 1
        }
        const response  = await axios.post(
          `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
          problemsPayload
        );
        res.json({
          message: `${response.data.result}`
        });
      //   res.json({ message: `${auth}` });
    } catch (err) {
      res.status(404).json({ message: `Cannot get all problems: ${err}` });
    }
  },
};

