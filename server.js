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

expressApp.use((req, res, next) => {
  console.log(`Request URL: ${req.url}`);
  console.log(`Request Body: ${JSON.stringify(req.body)}`);
  next();
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