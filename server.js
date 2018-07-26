"use strict";

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const app = express();
let server;

app.use(express.static('public'));
app.use(express.json());

const { DATABASE_URL, PORT } = require('./config');
const {UserProfile,PhoneNumber,Comment, testdata, testcomment} = require('./models');
//const { PhoneNumber } = require('./models');

app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/public/signup.html");
});

app.get("/seeddata", (req, res) => {
  res.sendFile(__dirname + "/seed-data.js");
});

//Just for testing...
app.get("/list", (req, res) => {
  console.log("list");
  testdata
    .find({})
    .populate("comment")//***Instead of pushing itself , push id of comment into array
    .exec() 
    .then(testdata => {
      console.log("a",testdata);
      return res.json(testdata);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
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
else{
  app.listen(process.env.PORT || 8080);
}

module.exports = app;//Use later for testing { runServer, app, closeServer };

