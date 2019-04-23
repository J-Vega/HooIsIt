
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const {localStrategy,jwtStrategy} = require('./auth/strategies.js');
const authRoute = require('./auth/router.js');

const app = express();

app.use(morgan("common"));
app.use(express.static('public'));

passport.use('localAuth',localStrategy);
passport.use('jwtAuth',jwtStrategy);

//Tells express you want to use passport
app.use(passport.initialize());
app.use(bodyParser.json());

app.use('/auth',function(req,res,next){ console.log(req.body); next()},authRoute);


const { PORT, DATABASE_URL} = require('./config');
const {UserProfile,PhoneNumber,UserComment} = require('./models');


var ObjectId = require('mongodb').ObjectId;

app.use(cors());
app.use(function (req, res, next) {
    
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    if(req.method === 'OPTIONS'){

      return res.sendStatus(204);
    }

    // Pass to next layer of middleware
    next();
});


//List all phone numbers
app.get("/list", cors(), (req, res) => {
  PhoneNumber
    .find()
    .sort({"_id":-1})
    .limit(5)
    .exec() 
    .then(PhoneNumber => {
      
      return res.json(PhoneNumber);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    });
});

//Find specific phone number
app.get("/search/:phoneNumber", cors(), (req, res) => {
  
  PhoneNumber
    .findOne({phoneNumber:req.params.phoneNumber})
    .exec()
    .then(listing => {
      return res.json(listing);
    })
    .catch(err => {
      return res.status(500).json({ message: 'Internal server error' });
    });
});

app.get("/listing/:phoneNumber", cors(), (req, res) => {
  res.sendFile(__dirname + "/public/listing.html");
});

//Get a specific phone number by id
app.get("/list/:id", cors(), (req, res) => {

  PhoneNumber
    .findById(req.params.id)
    .exec()
    .then(listing => {
      
      return res.json(listing);
    })
    .catch(err => {
      
      return res.status(500).json({ message: 'Internal server error' });
    });
});

//Searches all entries with a comment created by specified user name
app.get("/comments/:userName", cors(), (req, res) => {

  PhoneNumber
    .find({"comments":{$elemMatch:{creator:req.params.userName}}})
    .exec()
    .then(listing => {    
      return res.json(listing);
    })
    .catch(err => {
      return res.status(500).json({ message: 'Internal server error' });
    });
});

const removeCommentsForUser = (phoneNumber, userName) =>
  phoneNumber.comments.filter(xComment => xComment.creator === userName)
  .forEach(comment => phoneNumber.comments.remove(comment));

app.delete("/comments/:userName", cors(), (req, res) => {
  PhoneNumber
    .find(
      {})
    .then(phoneNumbers => phoneNumbers .forEach(
      ph => { 
        removeCommentsForUser(ph,req.params.userName);
      ph.save(); }))
    .then(listing => res.status(204).end())
    .catch(err => res.status(500).json({message: "Error deleting listing"}));
});


//Get all phone numbers
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
      flags: 1, // Will be used in the future - flags increase when someone searches that number.
      description: req.body.description,
      comments: req.body.comments
    })
    .then(listing => res.status(201).json(listing))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Posting new phone number failed'});
    });
});

//Add a new comment to phone number.
app.put("/list/:id", (req, res) => {

  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
        console.error(message);
      return res.status(400).json({ message: message });
  }

  let newComment = "";
  let creator = "";
  const updateableFields = ['comments','creator'];

  updateableFields.forEach(field => {
    if(field in req.body){
      if(field === 'comments')
      {
        newComment = req.body[field];
      }
      else if(field === 'creator')
      {
        creator = req.body[field];
      }
    }
  });

  PhoneNumber.findByIdAndUpdate(req.params.id, {$push : {"comments": {"content":`${newComment}`,"creator":`${creator}`}  }})//{"content":"Comment","created":"JVEGA"}}})//,creator: }})//,{$push: {comments:"This is a comment pushed via mongo shell"}} )//req.params.id,{ $push: {comments:"N"}})
  .then(phoneNumber => res.status(204).end())
  .catch(err => res.status(500).json({ message: err })); 
})

app.delete('/list/:id', (req, res) => {
  PhoneNumber
    .findByIdAndRemove(req.params.id)
    .then(listing => res.status(204).end())
    .catch(err => res.status(500).json({message: "Error deleting listing"}));
});




//--------- User Profile CRUD Operations ------------//
app.get("/users", (req, res) => {

  UserProfile
    .find()
    .exec() 
    .then(UserProfile => {
      return res.json(UserProfile);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    });
});

app.get("/users/:username", (req, res) => {
  UserProfile
    .findOne({userName:req.params.username})
    .exec()
    .then(listing => {
      
      return res.json(listing);
    })
    .catch(err => {
      
      return res.status(500).json({ message: 'Internal server error' });
    });
});

app.get("/users/:id", (req, res) => {
  UserProfile
    .findOne({id:req.params._id})
    .exec()
    .then(listing => {
      
      return res.json(listing);
    })
    .catch(err => {
      
      return res.status(500).json({ message: 'Internal server error' });
    });
});

app.get("/profile",(req, res) => {
  res.sendFile(__dirname + "/public/profile.html");
});

//Creating a new user
app.post('/users/', jsonParser, (req, res) => {
  const requiredFields = ['userName', 'password', 'firstName', 'lastName', 'email'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['userName', 'password', 'firstName', 'lastName', 'email'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  // If the username and password aren't trimmed we give an error.  Users might
  // expect that these will work without trimming (i.e. they want the password
  // "foobar ", including the space at the end).  We need to reject such values
  // explicitly so the users know what's happening, rather than silently
  // trimming them and expecting the user to understand.
  // We'll silently trim the other fields, because they aren't credentials used
  // to log in, so it's less of a problem.
  const explicityTrimmedFields = ['userName', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    userName: {
      min: 1
    },
    password: {
      min: 4,
      // bcrypt truncates after 72 characters
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let {userName, password, email = '', firstName = '', lastName = ''} = req.body;
  // Username and password come in pre-trimmed, otherwise we throw an error
  // before this
  firstName = firstName.trim();
  lastName = lastName.trim();
  email = email.trim();

  return UserProfile.find({userName})
    .count()
    .then(count => {
      if (count > 0) {
        // There is an existing user with the same username
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      // If there is no existing user, hash the password
      return UserProfile.hashPassword(password);
    })
    .then(hash => {
      
      return UserProfile.create({
        userName,
        password: hash,
        email,
        firstName,
        lastName
      });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      // Forward validation errors on to the client, otherwise give a 500
      // error because something unexpected has happened
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
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

  const toUpdate = {};
  const updateableFields = ['firstName', 'lastName', 'userName'];

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
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, {useNewUrlParser: true}, err => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(port, () => {
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

