const axios = require("axios");
const { isHostExists, getGoogleResponse,getTemplateIdByName, getAuth, stringToArray, getGroupIdByName, getHostIdByName, getAllHosts, isValidIpAddress, getHostByName, getSeverityNameById, cleanStringFromChars, getProblemIdByName, getAllProblems } = require("../utils/utils");
const _ = require('lodash');
const Problem = require("zabbix-rpc/lib/modules/Problem");
const { addStat } = require("../utils/stats");

const DEFAULT_PORT = '10050'

exports.hostController = {

  async createNewHost({ params }) {
    const hostIp = params.host_ip.replace(/\s/g, '');
    console.log(hostIp);
    const auth = await getAuth();
    const preHostName = params.host_name;
    const hostName=preHostName.toLowerCase();
    const groupList = stringToArray(params.host_groups)
    try {
      if (!isValidIpAddress(hostIp))
        throw 'Invalid IP address'
      if (await isHostExists(auth, hostName) == true) {
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
      const groupsIds = await getGroupIdByName({ auth, namesList: groupList })
      if (groupsIds.length !== groupList.length) {
        return {
          status: false,
          message: "Group name not found"
        }
      }
      const payload = {
        jsonrpc: "2.0",
        method: "host.create",
        params: {
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
      addStat("addHost");
      return {
        status: true,
        message: `${hostName} created successfully.`
      }
    }
    catch (err) {
      addStat("requestError");
      return {
        status: false,
        message: `Can't create host: ${hostName}. error: ${err} `
      }
    }
  },

  async deleteHost({ params }) {
    try {
      const hostNameArray = stringToArray(params.host_name);
      console.log({hostName: params.host_name})
      const auth = await getAuth();
      const allHosts = await getAllHosts(auth);
      const allIds = await getHostIdByName(auth, allHosts);
      const reqIds = await getHostIdByName(auth, hostNameArray);
      console.log({hostNameArray,reqIds})
      if(!reqIds.length){
        if(hostNameArray.length == 1) {
          return {
            status:false,
            message: `Host with the name ${params.host_name} was not found.`
          }
        }
        return {
          status:false,
          message: `one of the hosts ${params.host_name} was not found`
        }
      }
      const hostIdsArray = reqIds.map(({hostid}) => hostid);
      const allHostIdArray = allIds.map(allHostsIds => allHostsIds.hostid);
      if (isHostExists(allHostIdArray, hostIdsArray) === false) {
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
      addStat("deletedHost");

      return {
        status: true,
        message: `${hostNameArray} has been deleted`
      }

    } catch (error) {
      addStat("requestError");
      return {
        status: false,
        message: `Cannot delete: ${error}`
      };
    }
  },

  async validateHostFields(key,value,host,auth) {
    console.log({host});
    switch (key) {
      case 'host':
        const hostExists = await isHostExists(auth, value);
        if(hostExists === true){
          return {
            status: false,
            message: `Host name already exists`
          }
        } else {
          return {
            status: true,
            field: key,
            value: value.toLowerCase()
          }
        }

      case 'name':
        return {
          status: true,
          field: key,
          value: value
        }
      case 'status':
        const enableSynonyms = ['enable', 'enabled', 'active', 'on', '1', 'true', 'yes'];
        const disableSynonyms = ['disable', 'disabled', 'inactive', 'off', '0', 'false', 'no'];
        if (enableSynonyms.includes(value)) {
          return {
            status: true,
            field: key,
            value: '0'
          }
        }
        if (disableSynonyms.includes(value)) {
          return {
            status: true,
            field: key,
            value: '1'
          }
        }
        return {
          status: false,
          message: `Status can be only enable or disable`
        }
      case 'groups':
        const groupsIds = await getGroupIdByName({ auth, namesList: stringToArray(value) })
        if (groupsIds.length !== stringToArray(value).length) {
          return {
            status: false,
            message: "Not all group names found"
          }
        } else {
          return {
            status: true,
            field: key,
            value: groupsIds.map(item => {return {groupid: item.groupid}})
          }
        }
      case 'add_group':
        const allGroupsToAdd = new Array(...new Set(host.groups.concat(stringToArray(value))));
        if(allGroupsToAdd.length === host.groups.length) {
          return {
            status: false,
            message: "Group already exists"
          }
        }
        const groupsIdsToAdd = await getGroupIdByName({ auth, namesList: allGroupsToAdd })
        if (groupsIdsToAdd.length !== allGroupsToAdd.length) {
          return {
            status: false,
            message: "Not all group names found"
          }
        } else {
          return {
            status: true,
            field: "groups",
            value: groupsIdsToAdd.map(item => {return{groupid:item.groupid}})
          }
        }
      case 'add_template':
        const allTemplatesToAdd = new Array(...new Set(host.templates.concat(stringToArray(value))));
        if(allTemplatesToAdd.length === host.templates.length){
          return {
            status: false,
            message: "Template already exists"
          }
        }
        const templatesIdsToAdd = await getTemplateIdByName({ auth, namesList: allTemplatesToAdd })
        console.log({templatesIdsToAdd, allTemplatesToAdd})
        if (templatesIdsToAdd.length !== allTemplatesToAdd.length) {
          return {
            status: false,
            message: "Not all template names found"
          }
        } else {
          return {
            status: true,
            field: "templates",
            value: templatesIdsToAdd.map(item => {return{templateid:item.templateid}})
          }
        }
      case 'templates_clear':
        const templatesToClear = stringToArray(value);
        const templatesIdsToClear = await getTemplateIdByName({ auth, namesList: templatesToClear })
        if (templatesIdsToClear.length !== templatesToClear.length) {
          return {
            status: false,
            message: "Not all template names found"
          }
        } else {
          return {
            status: true,
            field: "templates_clear",
            value: templatesIdsToClear.map(item => {return{templateid:item.templateid}})
          }
        }
      case 'description':
        return {
          status: true,
          field: key,
          value: value
        }
      default:
        return {
          status: false,
          message: `Invalid field name`
        }
    }
  },

  async updateHost({ params }) {
    try {
      const auth = await getAuth();
      const host = await getHostByName(auth, params.host_name);
      if(!host) {
        return {
          status: false,
          message: `Host name ${params.host_name} not found, could not update`
        }
      }
      const fieldValidation = await this.validateHostFields(params.chosen_field,params.newValue,host,auth);
      console.log({fieldValidation});

      if(fieldValidation.status === false){
        return {
          status: false,
          message: fieldValidation.message
        }
      }
      const hostid = host.hostid;
      const payloadParams = {hostid};
      payloadParams[fieldValidation.field] = fieldValidation.value;
      const payload = {
        jsonrpc: "2.0",
        method: "host.update",
        params: payloadParams,
        auth,
        id: 3,
      };
      console.log({payload});
      const response = await axios.post(
        `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
        payload
      );
      if(response.data.error){ 
        console.error("editHost(): API response: " + JSON.stringify(response.data.error, null, 2));
        return {
          status: false,
          message: "Cannot update host, an unknown error occurred"
        }
      }
      return {
        status: true,
        message: `${params.host_name} has been updated`
      }
    } catch (error) {
      // addStat("requestError");
      console.log(error);
      return {
        status: false,
        message: `Cannot update host, an unknown error occurred`
      };
    }
  },
  async getAllHostsForResponse(params){
    try {
      const auth=await getAuth();
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
      return {
        status: true,
        message: `Zabbix hosts are: ${hostsList}`
      }
    } catch (err) {
      return {
        status: false,
        message: `Cannot get all host of zabbix`
      };
    }
  },

  async listAllHosts(params) {
    try{

      const auth = await getAuth();
      const allHosts = await getAllHosts(auth);
      const hostsMessage = allHosts.join(', ')
      return {
        status: true,
        message: `Here are the list of all hosts: ${hostsMessage}`
      }
    }
    catch(err) {
      return {
        status: false,
        message: `Can't list all hosts: ${err}`
      }
    }
    // const hostsMessage = allHosts.map(host => `${host}, `)

    // const sanitizationRetHosts = cleanStringFromChars(hostsMessage)
  },

};

