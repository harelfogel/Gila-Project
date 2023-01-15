const express = require("express");
require('dotenv').config();
const port = process.env.PORT || 3200;
const {hostCancelingRouter} =  require("./routers/hostCancelingRouter");
const {newHostRouter} =  require("./routers/newHostRouter");
const {problemsRouter} =  require("./routers/problemsRouter");
const app = express();
app.use(express.json());

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Gila team server." });
  });

// All- app routes:

app.use('/gila/host-canceling', hostCancelingRouter);

app.use('/gila/new-host', newHostRouter);

app.use('/gila/problems-list', problemsRouter);

app.use((req, res) => {
    res.status(400).send('Something is broken!');
  });

app.listen(port, () => console.log((`Gila server is running on port ${port}`)));