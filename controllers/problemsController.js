const axios = require("axios");
const { isHostExists, getGoogleResponse, getAuth, stringToArray, getGroupIdByName, getHostIdByName, getAllHosts, isValidIpAddress, getHostNameById, getSeverityNameById, cleanStringFromChars, getProblemIdByName, getAllProblems, getAllProblemsByHostName, listAllClosableTriggers, sevirityMap } = require("../utils/utils");
const _ = require('lodash');
const Problem = require("zabbix-rpc/lib/modules/Problem");
const { addStat } = require("../utils/stats");

const DEFAULT_PORT = '10050'

exports.problemsController = {
    async listAllProblems({ params }) {
        try {
          const hostName = _.get(params,'host_name');
          const problems = await getAllProblemsByHostName(hostName);
          const problemsMessage = problems.map((problemElem, index) => {
            return (
              // `${problemElem.severity}:${problemElem.problemName}`
              `Problem ${index + 1}: ${problemElem.name}, ${sevirityMap[problemElem.severity]}}`
            )
          });

          let problemsString = JSON.stringify(problemsMessage);
          //clean string from '[' , ']' and "," characters for cleaner reading for google assiataint
          let sanitizationRetProblems = cleanStringFromChars(problemsString);
          if (problems.length) {
            return {
              status: true,
              message: `Here are the problems of ${hostName}: ${sanitizationRetProblems}`
            }
          } else {
            throw `Empty problems list for the requested host`;
          }
    
        }
        catch (err) {
          addStat("requestError");
          return {
            status: false,
            message: `Cannot get problems: ${err}`
          };
        }
      },
      async listClosableProblemsByHostName(params) {
        try {
          const auth = await getAuth();
          const hostName = params.host_name;
          let hostid = await getHostIdByName(auth,hostName);
          console.log({hostid})
          hostid = hostid[0].hostid;
          const manualyClosableTriggers = await listAllClosableTriggers(params);
          console.log({manualyClosableTriggers:manualyClosableTriggers})
          const payload = {
            jsonrpc: "2.0",
            method: "problem.get",
            params: {
              output: "extend",
              objectids: manualyClosableTriggers.map((triggerObj)=>triggerObj.triggerid),
              hostids: hostid
            },
            auth,
            id: 1
          };
          const response = await axios.post(
            `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
            payload
          );
          const problems = response.data.result;
          const problemsToReturn = problems.map((problem) => {
            return {
              description: problem.name,
              severity: getSeverityNameById(problem.severity),
              id: problem.eventid,
              creationTime: problem.clock
            }
          });

          console.log(problemsToReturn);
          return {
            status: true,
            problems: problemsToReturn
          }
        }
        catch (err) {
          // addStat("requestError");
          return {
            status: false,
            message: `Cannot get problems, an unexpected error occured`
          };
        }
      },
      async closeProblem(eventid) {
        try {
          const auth = await getAuth();
          const payload = {
            jsonrpc: "2.0",
            method: "event.acknowledge",
            params: {
              eventids: eventid,
              action: 1,
              message: "Problem resolved."
            },
            auth,
            id: 1
          }
          const response = await axios.post(
            `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
            payload
          );
          console.log({payload,res:response.data});
          if(response.data.error){
            throw response.data.error;
          }
          return {
            status: true,
            message: `Problem closed successfully!`
          }
        } catch (err) {
          return {
            status: false,
            message: `Cannot close problem.`
          }
        }
      },
      async getAllProblemsByNameAndId({params}){
        try {
            const hostName = 'Zabbix server';
            //const hostName= _.get(params, 'host_name');
            const problems = await getAllProblemsByHostName(hostName);
            const problemObjects = problems.map((problem) => {
              return {
                description: problem.name,
                id: problem.eventid
              }
            })
            if (!problemObjects.length) {
                throw `Empty problems list`;
            } else {
              return problemObjects;
            }
      } catch(err){
        return `Canntot get all problems:${err}`;
      }
    }
}