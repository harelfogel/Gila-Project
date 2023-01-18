const express = require("express");
require('dotenv').config();
const port = process.env.PORT || 3200;
const path = require('path');
const GoogleAssistant = require('google-assistant');
const {loginRouter} =  require("./routers/loginRouter");
const {hostRouter} =  require("./routers/hostRouter");
const {replaceSpacesWithUnderScore,stringToArray,getGroupIdByName, getHostIdByName}= require("./utils/utils");


const res=async ()=>{
  const resutl= await getHostIdByName('deb882b789fe18f1a9575af7a986a0f4',[
    "Zabbix servers",
    "Linux server-TEST-3",
  ],"Linux server-TEST-3")
  console.log(resutl)
}
res();


const app = express();
app.use(express.json());

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Gila team server." });
  });

// All- app routes:
app.use('/gila/login',loginRouter);
app.use('/host', hostRouter);

app.use((req, res) => {
    res.status(400).send('Something is broken!');
  });
app.listen(port, () => console.log((`Gila server is running on port ${port}`)));