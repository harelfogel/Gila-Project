const axios = require("axios");
const { isHostExists, getGoogleResponse, getAuth, stringToArray, getGroupIdByName, getHostIdByName, getAllHosts, isValidIpAddress, getHostNameById, getSeverityNameById, cleanStringFromChars, getProblemIdByName, getAllProblems, getAllProblemsByHostName, listAllClosableTriggers } = require("../utils/utils");
const _ = require('lodash');
const Problem = require("zabbix-rpc/lib/modules/Problem");
const { addStat } = require("../utils/stats");

const DEFAULT_PORT = '10050'

exports.problemsController = {
    async listAllClosableProblems({ params }) {
        try {
        //const hostName= _.get(params, 'host_name');
          const hostName = params.host_name; //'Zabbix server';
          const problems = await getAllProblemsByHostName(hostName);
          const closableTriggers= await listAllClosableTriggers(hostName);
          const closableProblems= problems.filter((problemObj)=>{
            return closableTriggers.some((triggerObj)=>{
              return problemObj.objectid === triggerObj.triggerid 
            })
          })
          if(!closableProblems.length){
            throw `Empty Closable problems`;
          }
          const filteredProblemsArray = closableProblems.map((problem) => {
            return {
              problemName: problem.name,
              severity: getSeverityNameById(problem.severity),
              hostName: hostName
            }
          })

          const problemsMessage = filteredProblemsArray.map((problemElem, index) => {
            return (
              `${problemElem.severity}:${problemElem.problemName}`
            )
          });
          // let problemsString = JSON.stringify(problemsMessage);
          //clean string from '[' , ']' and "," characters for cleaner reading for google assiataint
          // let sanitizationRetProblems = cleanStringFromChars(problemsString);
          if (problems.length) {
            return {
              status: true,
              message: sanitizationRetProblems
            }
          } else {
            throw `Empty problems list`;
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
          const hostName = params.host_name;
          let hostid = await getHostIdByName(hostName);
          hostid = hostid[0].hostid;
          const manualyClosableTriggers = await listAllClosableTriggers(hostName);
          const payload = {
            jsonrpc: "2.0",
            method: "problem.get",
            params: {
              output: "extend",
              objectids: manualyClosableTriggers.map((triggerObj)=>triggerObj.triggerid),
              hostids: hostid
            },
            auth: await getAuth(),
            id: 1
          };
          const response = await axios.post(
            `${process.env.ZABBIX_SERVER_URL}/zabbix/api_jsonrpc.php`,
            payload
          );
          const problems = response.data.result;
          // console.log({problems});
          const problemsToReturn = problems.map((problem) => {
            return {
              description: problem.name,
              severity: getSeverityNameById(problem.severity),
              id: problem.eventid,
              creationTime: problem.clock
            }
          });
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
          //const hostName= _.get(params, 'host_name');
          // const hostName= params.host_name;'Zabbix servers';
          // const problems = await getAllProblemsByHostName('Zabbix server');
          // const problemName = _.get(params, 'problem_name');
          // const problemName = 'memory test trigger';
          // const eventid = getProblemIdByName(problems, 'memory test trigger')
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