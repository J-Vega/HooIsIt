const express = require('express');
const morgan = require('morgan');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const app = express();

app.use(morgan("common"));
app.use(express.static('public'));
app.use(express.json());

const { PORT, DATABASE_URL} = require('./config');
const {UserProfile,PhoneNumber,UserComment} = require('./models');
//const { PhoneNumber } = require('./models');

var ObjectId = require('mongodb').ObjectId;

app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/public/signup.html");
});

app.get("/seeddata", (req, res) => {
  res.sendFile(__dirname + "/seed-data.js");
});

//List all phone numbers
app.get("/list", (req, res) => {
  console.log("Finding all phone numbers");
  //console.log("list");
  PhoneNumber
    .find()

   // .populate("comment")//***Instead of pushing itself , push id of comment into array
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
      console.log(listing);
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

app.put("/list/:id", (req, res) => {
  console.log(req.params.id + " " + req.body._id);
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
        console.error(message);
      return res.status(400).json({ message: message });
  }

  let newComment = "";
  const updateableFields = ['comments'];

  //console.log("Adding comment to " +req.params.id);

  updateableFields.forEach(field => {
    if(field in req.body){
      newComment = req.body[field];
      console.log(newComment);
    }
  });
  console.log(newComment); 
  console.log(res);
  PhoneNumber.findByIdAndUpdate(req.params.id, {$push : {comments: newComment}})//,{$push: {comments:"This is a comment pushed via mongo shell"}} )//req.params.id,{ $push: {comments:"N"}})
  .then(phoneNumber => res.status(204).end())
  .catch(err => res.status(500).json({ message: 'Internal server error!' })); 
})

app.delete('/list/:id', (req, res) => {
  PhoneNumber
    .findByIdAndRemove(req.params.id)
    .then(listing => res.status(204).end())
    .catch(err => res.status(500).json({message: "Error deleting listing"}));
});


//--------- User Profile CRUD Operations ------------//
app.get("/users", (req, res) => {
  console.log("Finding all registered users");
  UserProfile
    .find()
    //.populate()//***Instead of pushing itself , push id of comment into array
    .exec() 
    .then(UserProfile => {
      //UserProfile line above is not arbitrary - must be the name of the import connected to the related collection (this one is named userdata on mlab)
      console.log(UserProfile);
      return res.json(UserProfile);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    });
});

app.get("/users/:id", (req, res) => {
  UserProfile
    .findById(req.params.id)
    .exec()
    .then(listing => {
      console.log(listing);
      return res.json(listing);
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({ message: 'Internal server error' });
    });
});

//Creating a new user
app.post("/users", (req, res) => {
  const requiredFields = ['userName', 'firstName', 'lastName', 'email'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  UserProfile
    .create({
      userName: req.body.userName,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email
      //created: Date.now,
      //userComments: []
    })
    .then(listing => res.status(201).json(listing))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Failed creating new user'});
    });
});

app.put('/users/:id', (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).json({ message: message });
  }

  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
  const toUpdate = {};
  const updateableFields = ['firstName', 'lastName', 'email', 'userName'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  UserProfile
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(user => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

app.delete('/users/:id', (req, res) => {
  UserProfile
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
 };

module.exports = { app, runServer, closeServer };

