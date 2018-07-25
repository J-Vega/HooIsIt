"use strict";

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const app = express();

app.use(express.static('public'));
app.use(express.json());

const { DATABASE_URL, PORT } = require('./config');
const {UserProfile,PhoneNumber,Comment, testdata, testcomment} = require('./models');
//const { PhoneNumber } = require('./models');

app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/public/signup.html");
});

//Just for testing...
app.get("/list", (req, res) => {
  testdata
    .find()
    // we're limiting because restaurants db has > 25,000
    // documents, and that's too much to process/return
    .limit(4)
    // success callback: for each restaurant we got back, we'll
    // call the `.serialize` instance method we've created in
    // models.js in order to only expose the data we want the API return.    
    .then(testdata => {
      res.json({
        testdata: testdata.map(
          (testdata) => testdata.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

//Use later for testing
function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

// Use later for testing
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}
//***This is causing an error when running npm start
// if (require.main === module) {
//   app.listen(process.env.PORT || 8080, function() {
//     console.info(`App listening on ${this.address().port}`);
//   });
// }

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

app.listen(process.env.PORT || 8080);

module.exports = app;//Use later for testing { runServer, app, closeServer };

