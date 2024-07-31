require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const cors = require('cors')
const KJUR = require('jsrsasign')

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { resolveNaptr, resolveSoa } = require('dns')

const app = express()
const port = process.env.PORT || 4848

const axios = require('axios');

const cron = require('node-cron');

app.use(bodyParser.json(), cors())
app.options('*', cors())


// Function to stop meeting (example)
function stopMeeting(meetingID) {
  // Add your code to stop the meeting here
  console.log("Stopping meeting...");
  
 fetchBearerToken().then(accesstoken=>{
    var verb='PUT';
    var url = `https://api.zoom.us/v2/meetings/${meetingID}/status`;
    
    const payloadObject = {
      action: 'end'
    };
    // Convert the object to a JSON string
    var payload = JSON.stringify(payloadObject);
    makeApiRequestWithToken(accesstoken,url,payload,verb);

  });
 
}


// Function to get participant count in LIVE meeting (example)
function getParticipantCountInMeeting(meetingID) {
  // Add your code to stop the meeting here
  console.log("Stopping meeting...");
  
 fetchBearerToken().then(accesstoken=>{
    var verb='GET';
    var url = `https://api.zoom.us/v2/metrics/meetings/${meetingID}?type=live`;
    
    const payloadObject = {
      action: 'end'
    };
    // Convert the object to a JSON string
    var payload = JSON.stringify(payloadObject);
    makeApiRequestWithToken(accesstoken,url,payload,verb);

  });
 
}


// Define a queue to hold task objects
const taskQueue = [];


function addTask(deadline, meetingID,  taskFunction) {
  taskQueue.push({ deadline, meetingID, taskFunction });
}

function processTasks() {
  console.log('Running cron loop');
  setInterval(() => {
    const now = new Date();
    for (let i = taskQueue.length - 1; i >= 0; i--) {
      const task = taskQueue[i];
      const now = new Date();
      const utcNow = new Date(now.toISOString()); // Convert now to UTC format
      // Get the end time as a Date object
       const endTime = new Date(task.deadline);

      // Check if the end time has passed
      if (endTime <= utcNow) {
        // Check if task.taskFunction is a function before calling it
        if (typeof task.taskFunction === 'function') {
          // Call task.taskFunction with meetingID as an argument
          task.taskFunction(task.meetingID);
          // Remove executed task from the queue
          taskQueue.splice(i, 1);
        } else {
          console.error('task.taskFunction is not a function');
        }
      }
    }
  }, 1000); // Check every second
}

// Example usage
addTask('Tue, 16 Apr 2024 06:34:56 GMT', '9898533313', stopMeeting);

// Start processing tasks
processTasks();


// Function to fetch a bearer token
async function fetchBearerToken() {
  try {
    // Create a Basic Authorization header with client credentials
    const credentials = Buffer.from(`${process.env.ZOOM_S2S_CLIENT_ID}:${process.env.ZOOM_S2S_CLIENT_SECRET}`).toString('base64');
    const apiUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_S2S_ACCOUNTID}`;
    
    // Define the token request parameters
    const tokenRequestData = {
      method: 'POST',
      url: apiUrl,
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    // Send the token request
    const response = await axios(tokenRequestData);

    // Extract the access token from the response
    const accessToken = response.data.access_token;
    // Return 
    return accessToken;
   
  } catch (error) {
    return error.message;
  }
}

// Function to make a REST API request using the bearer token
async function makeApiRequestWithToken(bearerToken,url,payload,verb) {
  try {


    //const apiUrl = `https://api.zoom.us/v2/meetings/${meetingNumber}/jointoken/local_recording`;
    
    // Define your API request parameters
    const apiRequestData = {
      method: verb, // Change to the HTTP method you need
      url: url, // Replace with your API endpoint URL
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
        // Add other headers as needed
      },
      data: payload,
    };

    axios(apiRequestData)
    .then(response => {
      // Log the response
      console.log('Response status:', response.status);
      // Resolve the promise with the response data
    
    }).catch(error => {
      console.error('Error making API request:', error.message);
      // Reject the promise with the error
      reject(error);
    });
 
  } catch (error) {
    console.error('Error making API request:', error.message);
    return error.message ; // Optionally rethrow the error
  }
}

  
  // Define a function to handle webhook requests
function handleWebhookRequest(req, res, secretToken, path) {

 var filePath ="/var/www/cron.asdc.cc/"+path+".txt"
  if (req.method === 'POST') {

  // Check if the event type is "endpoint.url_validation"
  if (req.body.event === 'endpoint.url_validation') {
    const hashForValidate = crypto.createHmac('sha256', secretToken)
      .update(req.body.payload.plainToken)
      .digest('hex');

    res.status(200).json({
      "plainToken": req.body.payload.plainToken,
      "encryptedToken": hashForValidate
    });

  //if this is an event
  } else {
    // Write the request data to a file
    fs.writeFile(filePath, JSON.stringify(req.body), 'utf8', function (err) {
      if (err) {
        return console.log(err);
      }
      console.log(`The file ${filePath} was saved!`);
    });

    switch (req.body.event) {
      case 'meeting.started':
        
        // Handle "meeting.started" event
        // add an event to stop meeting in 40 mins
         // Calculate the time for scheduling the task
         const eventTime = new Date(req.body.payload.object.start_time);
         const scheduledTime = new Date(eventTime.getTime() + 40 * 60000); // Add 40 minutes to event time

        
         var meetingID = req.body.payload.object.id;
        var startTimeString = req.body.payload.object.start_time;

        // Parse the start time string into a Date object
        const startTime = new Date(startTimeString);

        // Convert the start time to UTC
        const startTimeUTC = new Date(startTime.getTime() + startTime.getTimezoneOffset() * 60000);

        // Add 40 minutes to the start time
        const endTimeUTC = new Date(startTimeUTC.getTime() + 40 * 60000);

        // Format the end time in ISO 8601 format
        const endTimeString = endTimeUTC.toISOString();

         // Add a task with the calculated cron expression
         addTask(endTimeString, meetingID, stopMeeting);

        break;
      // Add cases for other event types if needed
      default:
        // Handle unknown event types
        console.log(`Unknown event type: ${req.body.event}`);
    }



    res.status(200).send();
  }

}else if (req.method === 'GET') {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading file' });
    }

    try {
      // Parse the JSON data
      const jsonData = JSON.parse(data);
      // Send the JSON data as a response
      res.status(200).json(jsonData);
    } catch (parseError) {
      res.status(500).json({ error: 'Error parsing JSON data' });
    }
  });

} else {
  // Handle unsupported HTTP methods
  res.status(405).send("Method Not Allowed");
}

}



app.post('/webhook/', (req, res) => {handleWebhookRequest(req,res, process.env.ZOOM_WEBHOOK_SECRET_TOKEN,"webhook");});
app.get('/webhook/', (req, res) => {handleWebhookRequest(req,res, process.env.ZOOM_WEBHOOK_SECRET_TOKEN,"webhook");});
app.post('/msdkwebhook/', (req, res) => {handleWebhookRequest(req,res, process.env.ZOOM_MSDKWEBHOOK_SECRET_TOKEN,"msdkwebhook");});
app.get('/msdkwebhook/', (req, res) => {handleWebhookRequest(req,res, process.env.ZOOM_MSDKWEBHOOK_SECRET_TOKEN,"msdkwebhook");});
app.post('/vsdkwebhook/', (req, res) => {handleWebhookRequest(req,res, process.env.ZOOM_VSDK_WEBHOOK_SECRET_TOKEN,"vsdkwebhook");  });
app.get('/vsdkwebhook/', (req, res) => {handleWebhookRequest(req,res, process.env.ZOOM_VSDK_WEBHOOK_SECRET_TOKEN,"vsdkwebhook");});
app.post('/oauthwebhookaccountlevel/', (req, res) => {handleWebhookRequest(req,res, process.env.ZOOM_OAUTH_ACCOUNTLEVEL_WEBHOOK_SECRET_TOKEN,"oauthwebhookaccountlevel");});
app.get('/oauthwebhookaccountlevel/', (req, res) => {handleWebhookRequest(req,res, process.env.ZOOM_OAUTH_ACCOUNTLEVEL_WEBHOOK_SECRET_TOKEN,"oauthwebhookaccountlevel");});
app.post('/oauthwebhookuserlevel/', (req, res) => {handleWebhookRequest(req,res, process.env.ZOOM_OAUTH_USERLEVEL_WEBHOOK_SECRET_TOKEN,"oauthwebhookuserlevel");});
app.get('/oauthwebhookuserlevel/', (req, res) => {handleWebhookRequest(req,res, process.env.ZOOM_OAUTH_USERLEVEL_WEBHOOK_SECRET_TOKEN,"oauthwebhookuserlevel");});
app.post('/s2soauthwebhook/', (req, res) => {handleWebhookRequest(req,res, process.env.ZOOM_S2SOAUTH_WEBHOOK_SECRET_TOKEN,"s2soauthwebhook");});
app.get('/s2soauthwebhook/', (req, res) => { handleWebhookRequest(req,res, process.env.ZOOM_S2SOAUTH_WEBHOOK_SECRET_TOKEN,"s2soauthwebhook"); });
      


app.get('/', (req, res) => {
  const htmlFile = fs.readFileSync('staticpages/index.html', 'utf8');
  res.set('Content-Type', 'text/html');
  res.send(htmlFile);
});





app.listen(port, () => console.log(`Running Node.js Sample App on port ${port}!`))
