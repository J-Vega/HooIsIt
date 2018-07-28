const express = require('express');
const morgan = require('morgan');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const app = express();

app.use(morgan("common"));
app.use(express.static('public'));
app.use(express.json());

const { PORT, DATABASE_URL} = require('./config');
const {UserProfile,PhoneNumber,Comment, testcomment} = require('./models');
//const { PhoneNumber } = require('./models');

app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/public/signup.html");
});

app.get("/seeddata", (req, res) => {
  res.sendFile(__dirname + "/seed-data.js");
});

//List all phone numbers
app.get("/list", (req, res) => {
  console.log("list");
  PhoneNumber
    .find()

    .populate("comment")//***Instead of pushing itself , push id of comment into array
    .exec() 
    .then(PhoneNumber => {
      console.log(PhoneNumber);
      return res.json(PhoneNumber);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    });
});

//List a specific phone number by id
app.get("/list/:id", (req, res) => {
  PhoneNumber
    .findById(req.params.id)
    .exec()
    .then(listing => {
      //console.log(listing);
      return res.json(listing);
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({ message: 'Internal server error' });
    });
});

app.post("/list", (req, res) => {
  const requiredFields = ['phoneNumber', 'description'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  PhoneNumber
    .create({
      phoneNumber: req.body.phoneNumber,
      flags: 1,//Always start with 1
      description: req.body.description,
      delete: 3,
      comments: req.body.comments
      //created: Date.now,
      //comments: "new comment"
    })
    .then(listing => res.status(201).json(listing))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Posting new phone number failed'});
    });
});

// app.put("/list/:id", (req, res) => {
  
//   // ensure that the id in the request path and the one in request body match
//   if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
//     const message = (
//       `Request path id (${req.params.id}) and request body id ` +
//       `(${req.body.id}) must match`);
//     console.error(message);
//     return res.status(400).json({ message: message });
//   }

//   const toUpdate = {};
//   const updateableFields = ['comments'];

//   console.log("Adding comment to " +req.params.id);

//   updateableFields.forEach(field => {
//     if(field in req.body{
//       toUpdate[field] = req.body[field];
//     })
//   });

//   PhoneNumber.findByIdAndUpdate(req.params.id,{ $set: toUpdate})
//   .then(phoneNumber => res.status(204).end())
//   .catch(err => res.status(500).json({ message: 'Internal server error' })); 
// })

app.delete('/list/:id', (req, res) => {
  PhoneNumber
    .findByIdAndRemove(req.params.id)
    .then(listing => res.status(204).end())
    .catch(err => res.status(500).json({message: "Error deleting listing"}));
});

let server;


function runServer(databaseUrl, port = PORT) {
  console.log(databaseUrl);
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
};

function closeServer() {
  
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };

