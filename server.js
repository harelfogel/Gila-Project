const express = require("express");
require('dotenv').config();
const port = process.env.PORT || 3200;
const path = require('path');
const GoogleAssistant = require('google-assistant');
const {loginRouter} =  require("./routers/loginRouter");
const {hostRouter} =  require("./routers/hostRouter");
const {replaceSpacesWithUnderScore}= require("./utils/utils");
// Import the service function and various response classes

console.log(replaceSpacesWithUnderScore('Hey goggog wite me somthing'));
// const {
//   dialogflow,
//   actionssdk,
//   Image,
//   Table,
//   Carousel,
// } = require('actions-on-google');

// const {
//   conversation,
//   Image,
// } = require('@assistant/conversation')


const app = express();
// const dialogFlowApp = dialogflow();
// // Create an app instance
// const convApp = conversation();

// convApp.handle('<YOUR HANDLER NAME>', conv => {
//   conv.add('Hi, how is it going?')
//   conv.add(new Image({
//     url: 'https://developers.google.com/web/fundamentals/accessibility/semantics-builtin/imgs/160204193356-01-cat-500.jpg',
//     alt: 'A cat',
//   }))
// })

// dialogFlowApp.intent('Default Welcome Intent', (conv) => {
//   conv.ask('How are you?');
// });

// dialogFlowApp.intent('bye', (conv) => {
//   conv.close('See you later!');
// });

// dialogFlowApp.catch((conv, error) => {
//   console.error(error);
//   conv.ask('I encountered a glitch. Can you say that again?');
// });

app.use(express.json());

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Gila team server." });
  });

// All- app routes:

app.use('/gila/login',loginRouter);

app.use('/host', hostRouter)

app.use((req, res) => {
    res.status(400).send('Something is broken!');
  });




// google assisatint----------------------------------------------------

const config = {
  auth: {
    keyFilePath: path.resolve(__dirname, `${process.env.GOOGLE_OAUTH_SECRET}`),
    // where you want the tokens to be saved
    // will create the directory if not already there
    savedTokensPath: path.resolve(__dirname, 'tokens.json'),
    // you can also pass an oauth2 client instead if you've handled
    // auth in a different workflow. This trumps the other params.
    oauth2Client: process.env.CLIENT_SECRET,
  },
  // this param is optional, but all options will be shown
  conversation: {
    audio: {
      encodingIn: 'LINEAR16', // supported are LINEAR16 / FLAC (defaults to LINEAR16)
      sampleRateIn: 16000, // supported rates are between 16000-24000 (defaults to 16000)
      encodingOut: 'LINEAR16', // supported are LINEAR16 / MP3 / OPUS_IN_OGG (defaults to LINEAR16)
      sampleRateOut: 24000, // supported are 16000 / 24000 (defaults to 24000)
    },
    lang: 'en-US', // language code for input/output (defaults to en-US)
    // deviceModelId: 'xxxxxxxx', // use if you've gone through the Device Registration process
    // deviceId: 'xxxxxx', // use if you've gone through the Device Registration process
    textQuery: 'What time is it?', // if this is set, audio input is ignored
    isNew: true, // set this to true if you want to force a new conversation and ignore the old state
    screen: {
      isOn: true, // set this to true if you want to output results to a screen
    },
  },
};



  app.listen(port, () => console.log((`Gila server is running on port ${port}`)));