const axios = require("axios");
const { isHostExists,getGoogleResponse, getAuth, stringToArray, getGroupIdByName, getHostIdByName, getAllHosts } = require("../utils/utils");



exports.hostController = {

  async createNewHost({params}) {
    console.log({params})
    try{
      const auth = await getAuth();
      console.log({auth})
      const hostName = params.host_name;
      const groupList = stringToArray(params.host_groups)
      if (await isHostExists(auth, hostName) == true){
        console.log("CHECK")
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
      console.log({groupList})
      const groupsIds = await getGroupIdByName({auth, namesList: groupList })
      if(groupsIds.length !== groupList.length){
        return {
          status: false,
          message: "Group name not found"}
      }

      console.log({groupsIds})

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
      console.log({params})
      const hostName = params.host_name;
      const auth = await getAuth();
      const allHosts = await getAllHosts(auth);
      const allIds = await getHostIdByName(auth, allHosts)
      const hostId = allIds.filter(item => hostName === item.name)
      console.log({hostId}, [hostId[0].hostid])
      
      // const middlewarePayload = req.data;
      const payload = {
        jsonrpc: "2.0",
        method: "host.delete",
        params: [hostId[0].hostid],
        auth,
        id: 3,
      };
      const response = await axios.post(
        `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
        payload
      );

      console.log({delete_data: response.data})
      
      return {
        status: true,
        message: `${hostName} has been deleted`
      }

    } catch (error) {
      
      // res.status(404).json({ message: `Cant delete Host:  ${err}` });
      console.log(err);
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

