const express = require("express");
require('dotenv').config();
const { conversation } = require('@assistant/conversation')
const port = 443;
const bodyParser = require('body-parser')

const https = require('https');
const fs = require('fs');
const { hostController } = require("./controllers/hostController");
const { groupController } = require("./controllers/groupsController");
const { getGroupIdByName, getAuth, getHostIdByName } = require("./utils/utils");
const CERT_PATH = '/etc/letsencrypt/live/gila.shenkar.cloud/fullchain.pem';
const KEY_PATH = '/etc/letsencrypt/live/gila.shenkar.cloud/privkey.pem';

const app = conversation();
const expressApp = express().use(bodyParser.json());

const resText = "These are not the droids you are looking for."

const testAuth= '8f774ea17b24a26fb8c0295dbc20786a';

const problemsTest=async ()=>{
  const test=await hostController.listAllProblems('10084');
  console.log({test:test.message})
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



expressApp.post('/fulfillment', app);


https.createServer({
  key: fs.readFileSync(KEY_PATH),
  cert: fs.readFileSync(CERT_PATH)
}, expressApp)
  .listen(port, () => {
    console.log(`Gila server is running on port ${port}`)
  }
  );