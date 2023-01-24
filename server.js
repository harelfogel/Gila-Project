const express = require("express");
require('dotenv').config();
const { conversation } = require('@assistant/conversation')
const port = 443;
const bodyParser = require('body-parser')
const axios = require("axios");

const _ = require('lodash');
const https = require('https');
const fs = require('fs');
const { hostController } = require("./controllers/hostController");
const { groupController } = require("./controllers/groupsController");
const { addStat, readStats } = require("./utils/stats");
const { getAuth,isHostExists } = require("./utils/utils");
const { concat } = require("lodash");
const CERT_PATH = '/etc/letsencrypt/live/gila.shenkar.cloud/fullchain.pem';
const KEY_PATH = '/etc/letsencrypt/live/gila.shenkar.cloud/privkey.pem';

const app = conversation();
const expressApp = express().use(bodyParser.json());

const resText = "These are not the droids you are looking for."

const testAuth= '8f774ea17b24a26fb8c0295dbc20786a';

const problemsTest=async ()=>{
  const test=await hostController.listAllProblems('10084');
  console.log(await hostController.closeProblems('')); 
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

app.handle('closeProblemStart', async conv => {
  console.log('*********closeProblemStart******');
  // const response = await hostController.listAllClosableProblems({params: conv.session.params});
  conv.session.params.problems = ['CPU usage is too high on Zabbix server [trapper #1] on "Zabbix server"', 'CPU usage is too high on Zabbix server [trapper #2] on "Zabbix server"'];
  conv.session.params.problemIds = ['10084', '10085'];
  conv.session.params.hostId = '10084';
  conv.session.params.currentProblem = 0;
  conv.add('<speak>' + conv.session.params.problems[0] + '<break time="600ms"/> Do you want to close it?' + '</speak>');
  // console.log({message: response.message})
  // conv.add(response.message);
});

app.handle('closeProblem', async conv => {
  console.log('*********closeProblem******');
  // const response = await hostController.listAllProblems({params: conv.session.params});
  if(conv.intent.name === "yes") {
    // const response = await hostController.closeProblems({hostId: conv.session.params.hostId, problemId: conv.session.params.problemIds[conv.session.params.currentProblem]});
    conv.session.params = {}
    conv.scene.next.name = 'MainMenu';
    conv.add('<speak>'+'problem closed!' + '<break time="600ms"/>' + '</speak>');
  } else {
    conv.session.params.currentProblem++;
    if(conv.session.params.currentProblem < conv.session.params.problems.length){
      conv.scene.next.name = 'closeProblemYesNo';
      conv.add('<speak>' + conv.session.params.problems[conv.session.params.currentProblem] + '<break time="600ms"/> Do you want to close it?' + '</speak>');
    }else{
      conv.scene.next.name = 'MainMenu';
      conv.add('<speak> There are no more problems <break time="600ms"/></speak>');
    }
  }
});

app.handle("closeProblemSlotValidation", async conv => {
  console.log('*********closeProblemSlotValidation******');
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