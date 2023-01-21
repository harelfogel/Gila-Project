const axios = require("axios");
const { isHostExists,getGoogleResponse, getAuth, stringToArray, getGroupIdByName } = require("../utils/utils");



exports.hostController = {

  async createNewHost({params}) {
    console.log({params})
    try{
      const auth = await getAuth();
      const hostName = params.host_name;
      const groupList = stringToArray(params.host_groups)
      const tags = groupList.map(item => {
        return {
          tag: "Host Name",
          value: item
        }
      })
      const groupsIds = []
      groupList.map(item => {
        groupsIds.push({groupid: getGroupIdByName({
          auth,
          namesList: groupList,
          desiredName: item
        })})
      })
      console.log({params})

      const payload = {
        jsonrpc: "2.0",
        method: "host.create",
        params:{
          host: hostName,
          groups: groupsIds,
          tags
        }
      }
    }
    catch(err){
      console.log(err)
    }
  },





  async createHost(req, res) {
    try {
      const middlewarepayload = req.data;
      if((await isHostExists(middlewarepayload.auth,middlewarepayload.hostName)) == true){
        throw `Host is already exist.`;
      }
      console.log({middlewarepayload})
      const createHostPayload = {
        jsonrpc: "2.0",
        method: "host.create",
        params: {

          host: middlewarepayload.hostName,

          interfaces: [
            {
              type: 1,
              main: 1,
              useip: 1,
              ip: `${process.env.ZABBIX_SERVER_IP}`,
              dns: "",

              port: middlewarepayload.port,
            },
          ],
          groups: middlewarepayload.groups,
          tags: [
            {
              tag: "Host name",
              value: "Linux server",
            },
          ],
        },

        auth: middlewarepayload.auth,
        id: 1,
      };
      console.log({createHostPayload})

      const response = await axios.post(
        `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
        createHostPayload
      );
      const googleResponse=getGoogleResponse(middlewarepayload.hostName,'create host'); 
      res.json({googleResponse}); 

    } catch (err) {
      res.status(404).json({ message: `Cant create Host:  ${err}` });
      console.log(err);
    }
  },
  async deleteHost(req, res) {
    try {
      const middlewarePayload = req.data;
      const deletePayload = {
        jsonrpc: "2.0",
        method: "host.delete",
        params: middlewarePayload.params,
        auth: middlewarePayload.auth,
        id: 1,
      };
      const response = await axios.post(
        `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
        deletePayload
      );
      const googleResponse=getGoogleResponse(middlewarePayload.params.hostName,'delete host');
      res.json({
        googleResponse
      });
    } catch (error) {
      res.status(404).json({ message: `Cant delete Host:  ${err}` });
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

