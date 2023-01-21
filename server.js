const express = require("express");
require('dotenv').config();
const { conversation } = require('@assistant/conversation')
const port = 443;

const https = require('https');
const fs = require('fs');
const CERT_PATH = '/etc/letsencrypt/live/gila.shenkar.cloud/fullchain.pem';
const KEY_PATH = '/etc/letsencrypt/live/gila.shenkar.cloud/privkey.pem';

const app = conversation();
const expressApp = express().use(bodyParser.json());

const resText = "These are not the droids you are looking for."

expressApp.use((req, res, next) => {
  console.log(`Request URL: ${req.url}`);
  console.log(`Request Body: ${JSON.stringify(req.body)}`);
  next();
});

app.handle('createHost', conv => {
  console.log('*********createHost******');
  conv.add(resText);
});

app.handle('deleteHost', conv => {
  console.log('*********deleteHost******');
  conv.add(resText);
});

app.handle('listHosts', conv => {
  console.log('*********listHosts******');
  conv.add(resText);
});

app.handle('listProblems', conv => {
  console.log('*********listProblems******');
  conv.add(resText);
});

app.handle('ackProblem', conv => {
  console.log('*********ackProblem******');
  conv.add(resText);
});

app.handle('createGroup', conv => {
  console.log('*********createGroup******');
  conv.add(resText);
});

app.handle('deleteGroup', conv => {
  console.log('*********deleteGroup******');
  conv.add(resText);
});

app.handle('editHost', conv => {
  console.log('*********editHost******');
  conv.add(resText);
});

app.handle('cloneHost', conv => {
  console.log('*********cloneHost******');
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