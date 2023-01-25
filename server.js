const express = require("express");
require('dotenv').config();
const { conversation } = require('@assistant/conversation')
const port = 443;
const bodyParser = require('body-parser')
const axios = require("axios");
const moment = require("moment");
const _ = require('lodash');
const https = require('https');
const fs = require('fs');
const { hostController } = require("./controllers/hostController");
const { groupController } = require("./controllers/groupsController");
const { problemsController } = require("./controllers/problemsController");
const { addStat, readStats } = require("./utils/stats");
const { getAuth,isHostExists, listAllTriggersByHostName, listAllClosableTriggers } = require("./utils/utils");
const { concat } = require("lodash");
const CERT_PATH = '/etc/letsencrypt/live/gila.shenkar.cloud/fullchain.pem';
const KEY_PATH = '/etc/letsencrypt/live/gila.shenkar.cloud/privkey.pem';

const app = conversation();
const expressApp = express().use(bodyParser.json());

const resText = "These are not the droids you are looking for."

const testAuth= '8f774ea17b24a26fb8c0295dbc20786a';

const problemsTest=async ()=>{
  const test=await problemsController.listAllClosableProblems('10084');
 console.log(test);
  //console.log(await listAllClosableTriggers(''));
}


problemsTest();


expressApp.use((req, res, next) => {
  console.log(`Request URL: ${req.url}`);
  console.log(`Request Body: ${JSON.stringify(req.body)}`);
  next();
});


app.handle('createHost', async conv  => {
  console.log('*********createHost******');
  const response = await hostController.createNewHost({params: conv.session.params})
  conv.add(response.message);
});

app.handle('deleteHost', async conv => {
  console.log('*********deleteHost******');
  const response = await hostController.deleteHost({params: conv.session.params})
  conv.add(response.message);
});

app.handle('listHosts', conv => {
  console.log('*********listHosts******');
  conv.add(resText);
});

app.handle('listProblems', async conv => {
  console.log('*********listProblems******');
  const response = await hostController.listAllProblems({params: conv.session.params});
  console.log({message: response.message})
  conv.add(response.message);
});

const buildProblemSpeech = (problem) => {
  const problemCreationDate = moment.unix(problem.creationTime).format('DD/MM/YYYY');
  const problemCreationTime = moment.unix(problem.creationTime).format('HH:mm:ss');
  const severityEmphasisDict = {
    'Not classified': 'none',
    'Information': 'reduced',
    'Warning': 'moderate',
    'Average': 'moderate',
    'High': 'strong',
    'Disaster': 'strong'
  };
  return `<speak>Problem severity is: <prosody rate="slow"> <emphasis level="${severityEmphasisDict[problem.severity]}"> ${problem.severity} </emphasis></prosody><break time="300ms"/> ${problem.description} <break time="200ms"/> Created at <say-as interpret-as="date" format="ddmmyyyy"> ${problemCreationDate} </say-as> <say-as interpret-as="time" format="hms24"> ${problemCreationTime} </say-as>  <break time="600ms"/> Do you want to close it?</speak>`;
}

app.handle('closeProblemStart', async conv => {
  console.log('*********closeProblemStart******');
  const response = await problemsController.listClosableProblemsByHostName(conv.session.params);
  if(response.status === false) {
    conv.add(response.message);
    conv.scene.next.name = 'MainMenu';
    return;
  }
  conv.session.params.problems = response.problems;
  conv.session.params.currentProblem = 0;
  if(conv.session.params.problems.length === 0) {
    conv.add('There are no problems to close');
    conv.scene.next.name = 'MainMenu';
    return;
  }

  conv.add(buildProblemSpeech(conv.session.params.problems[conv.session.params.currentProblem]));
  // console.log({message: response.message})
  // conv.add(response.message);
});

app.handle('closeProblem', async conv => {
  console.log('*********closeProblem******');
  if(conv.intent.name === "yes") {
    console.log({problem: conv.session.params.problems[conv.session.params.currentProblem]})
    const response = await problemsController.closeProblem(conv.session.params.problems[conv.session.params.currentProblem].id);
    conv.session.params = {}
    conv.scene.next.name = 'MainMenu';
    conv.add('<speak>'+ response.message + '<break time="600ms"/>' + '</speak>');
  } else {
    conv.session.params.currentProblem++;
    if(conv.session.params.currentProblem < conv.session.params.problems.length){
      conv.scene.next.name = 'closeProblemYesNo';
      conv.add(buildProblemSpeech(conv.session.params.problems[conv.session.params.currentProblem]));
    } else {
      conv.scene.next.name = 'MainMenu';
      conv.add('<speak> There are no more problems <break time="600ms"/></speak>');
    }
  }
});

app.handle("hostNameSlotValidation", async conv => {
  console.log('*********hostNameSlotValidation******');
  const hostName = conv.scene.slots['host_name'].value;
  const auth = await getAuth();
  const hostExists = await isHostExists(auth, hostName);
  console.log({hostName, hostExists});
  // make sure the host exists
  if(!hostExists){
    console.log('host does not exist');
    conv.scene.slots['host_name'].status = 'INVALID';
    conv.add(`<speak>Host ${hostName} does not exist, <break time="600ms"/> please try again </speak>`);
  }
});

app.handle('ackProblem', conv => {
  console.log('*********ackProblem******');
  conv.add(resText);
});

app.handle('createGroup', async conv => {
  console.log('*********createGroup******');
  const response = await groupController.createGroup({params: conv.session.params})
  conv.add(response.message);
});

app.handle('deleteGroup', async conv => {
  console.log('*********deleteGroup******');
  const response = await groupController.deleteGroup({params: conv.session.params})
  conv.add(response.message);
});

app.handle('editHost', conv => {
  console.log('*********editHost******');
  conv.add(resText);
});

app.handle('cloneHost', conv => {
  console.log('*********cloneHost******');
  conv.add(resText);
});

app.handle('createUser', async conv => {
  console.log('*********createUser******');
  const response = await groupController.createUser({params: conv.session.params})

  conv.add(resText);
});

expressApp.get('/healthcheck', (req, res) => {
  console.log('*********healthcheck******');
  res.send('Hello World!');
  addStat("test");
})

expressApp.get('/stats', (req, res) => {
  console.log('*********stats******');
  res.send(readStats());
})

expressApp.post('/fulfillment', app);
https.createServer({
  key: fs.readFileSync(KEY_PATH),
  cert: fs.readFileSync(CERT_PATH)
}, expressApp)
  .listen(port, () => {
    console.log(`Gila server is running on port ${port}`)
  }
  );