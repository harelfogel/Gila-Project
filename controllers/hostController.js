const axios = require("axios");
const { isHostExists,getGoogleResponse, getAuth, stringToArray, getGroupIdByName, getHostIdByName, getAllHosts, isValidIpAddress, getHostNameById,getSeverityNameById, cleanStringFromChars } = require("../utils/utils");
const _ = require('lodash');
const Problem = require("zabbix-rpc/lib/modules/Problem");

const DEFAULT_PORT = '10050'



exports.hostController = {

  async createNewHost({params}) {
    const hostIp = params.host_ip.replace(/\s/g, '');
    const auth = await getAuth();
    const hostName = params.host_name;
    const groupList = stringToArray(params.host_groups)
    try{
      if(!isValidIpAddress(hostIp))
        throw 'Invalid IP address'
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
          tags,
          interfaces: [
            {
              type: 1,
              main: 1,
              useip: 1,
              ip: hostIp,
              dns: "",
              port: DEFAULT_PORT
            }
          ],
        },
          auth: auth,
        id: 1
      }

      const response = await axios.post(
        `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
        payload
      );
      return {
        status: true,
        message: `${hostName} created successfully.`
      }
    }
    catch(err){

      return {
        status: false,
        message: `Can't create host: ${hostName}. error: ${err} `
      }
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
      if(isHostExists(allHostIdArray,hostIdsArray) === false){
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

  async listAllProblems({params}) {
    try{
      const auth = await getAuth();
      const hostName = 'Zabbix server';
      //const hostName = params.host_name;
      const allHosts = await getAllHosts(auth);
      const allHostsIds = await getHostIdByName(auth, allHosts);
      const host = allHostsIds.filter(({name}) => name === hostName)
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
      const response  = await axios.post(
        `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
        payload
      );
      const problems = _.get(response,'data.result',[]);
      const shortProblemsArray= problems.map((problem)=>{
        return {
          problemName:problem.name,
          severity:getSeverityNameById(problem.severity),
          hostName:hostName 
        }
      })
       problemsMessage= shortProblemsArray.map((problemElem,index) => {
        return(
        `Problem number ${index},Problem name is:${problemElem.problemName},Problem severity is:${problemElem.severity}, Problem readback host name is:${problemElem.hostName}`
        )
      });
      let problemsString=JSON.stringify(problemsMessage);
      //clean string from '[' , ']' and "," characters for cleaner reading for google assiataint
      let sanitizationRetProblems=cleanStringFromChars(problemsString);  
      if(problems.length){
        return {
          status: true,
          message:sanitizationRetProblems
        }
      } else{
        throw `Empty problems list`;
      }

    }
    catch(err){
      return {
        status:false,
        message:`Cannot get problems: ${err}`
      };
    }
  },

};

