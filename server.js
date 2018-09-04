
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
// const {window} = new JSDOM();
// const {document} = (new JSDOM('')).window;
// global.document = document;
const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const {localStrategy,jwtStrategy} = require('./auth/strategies.js');
const authRoute = require('./auth/router.js');
console.log(authRoute);
const app = express();
//var $ = require('jquery')(window);
app.use(morgan("common"));
app.use(express.static('public'));
//app.use(express.json());
passport.use('localAuth',localStrategy);
passport.use('jwtAuth',jwtStrategy);
//Tell express you want to use passport
app.use(passport.initialize());
app.use(bodyParser.json());

app.use('/auth',function(req,res,next){ console.log(req.body); next()},authRoute);


const { PORT, DATABASE_URL} = require('./config');
const {UserProfile,PhoneNumber,UserComment} = require('./models');
//const { PhoneNumber } = require('./models');

var ObjectId = require('mongodb').ObjectId;

// const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);

app.use(cors());
app.use(function (req, res, next) {
    console.log(req.body);
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



app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/public/signup.html");
});

app.get("/seeddata", (req, res) => {
  res.sendFile(__dirname + "/seed-data.js");
});

//Added to router for auth middleware
// app.get("/profile", (req, res) => {
//   res.sendFile(__dirname + "/public/profile.html");
// });

//List all phone numbers
app.get("/list", cors(), (req, res) => {
  console.log("Finding all phone numbers");
  console.log("list");
  PhoneNumber
    .find()

   // .populate("comment")//***Instead of pushing itself , push id of comment into array
    .exec() 
    .then(PhoneNumber => {
      //console.log(PhoneNumber);
      return res.json(PhoneNumber);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    });
});

//Find specific phone number
app.get("/search/:phoneNumber", cors(), (req, res) => {

  //res.sendFile(__dirname + "/public/listing.html");
  
  console.log("searching forrrrrrr " +req.params.phoneNumber);
  PhoneNumber
    .findOne({phoneNumber:req.params.phoneNumber})
    .exec()
    .then(listing => {
      console.log(req.params.phoneNumber);
      return res.json(listing);
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({ message: 'Internal server error' });
    });
});

app.get("/listing/:phoneNumber", cors(), (req, res) => {

  res.sendFile(__dirname + "/public/listing.html");
  
});

//Get a specific phone number by id
app.get("/list/:id", cors(), (req, res) => {
  console.log("searchNumber function called");
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

//Searches all entries with a comment created by specified user name
app.get("/comments/:userName", cors(), (req, res) => {
  console.log("searching comments posted by: "+ req.params.userName);
  PhoneNumber
    .find({"comments":{$elemMatch:{creator:req.params.userName}}})
    .exec()
    .then(listing => {
      console.log("Results below...");
      //var commentList = [];//Will return list of comments **after filtered properly
      // for(var i=0; i < listing.length;i++){
      //   console.log(`${listing[i].comments.entries}`);  
      // }
      
      return res.json(listing);
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({ message: 'Internal server error' });
    });
});

const removeCommentsForUser = (phoneNumber, userName) =>
  phoneNumber.comments.filter(xComment => xComment.creator === userName)
  .forEach(comment => phoneNumber.comments.remove(comment));

app.delete("/comments/:userName", cors(), (req, res) => {
  console.log("deleting all comments posted by: "+ req.params.userName);
  PhoneNumber
    .find(
      {})
    .then(phoneNumbers => phoneNumbers .forEach(
      ph => { 
        removeCommentsForUser(ph,req.params.userName);
      ph.save(); }))//console.log(comment))))
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
      flags: 1,//Always start with 1
      description: req.body.description,
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

//Add a new comment to phone number.
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
  let creator = "";
  const updateableFields = ['comments','creator'];

  //Need comment, username and user id content / creator

  //console.log("Adding comment to " +req.params.id);

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
  console.log("New comment is "+ newComment +"And creator is " +creator); 
  //console.log(res);
  console.log(newComment);

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

// app.get("/users/:id", (req, res) => {
//   UserProfile
//     .findById(req.params.id)
//     .exec()
//     .then(listing => {
//       console.log(listing);
//       return res.json(listing);
//     })
//     .catch(err => {
//       console.log(err);
//       return res.status(500).json({ message: 'Internal server error' });
//     });
// });

app.get("/users/:username", (req, res) => {
  UserProfile
    .findOne({userName:req.params.username})
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

app.get("/users/:id", (req, res) => {
  UserProfile
    .findOne({id:req.params._id})
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

app.get("/profile",(req, res) => {
  console.log("Accessing user profile");
  res.sendFile(__dirname + "/public/profile.html");
  //window.location.replace("/profile.html");
});


// app.post("/users", jsonParser, (req, res) => {
//   const requiredFields = ['userName', 'firstName', 'lastName', 'password'];
//   for (let i = 0; i < requiredFields.length; i++) {
//     const field = requiredFields[i];
//     //If a field is missing, send 422 validation error
//     if (!(field in req.body)) {
//       const message = `Missing \`${field}\` in request body`;
//       console.error(message);
//       return res.status(422).send(message);
//     }
//   }

//   const stringFields = ['userName', 'firstName', 'lastName', 'password'];
//   const nonStringField = stringFields.find(
//     field => field in req.body && typeof req.body[field] !== 'string'
//   );

//   if (nonStringField) {
//     return res.status(422).json({
//       code: 422,
//       reason: 'ValidationError',
//       message: 'Incorrect field type: expected string',
//       location: nonStringField
//     });
//   }

//   const explicityTrimmedFields = ['userName', 'password'];
//   const nonTrimmedField = explicityTrimmedFields.find(
//     field => req.body[field].trim() !== req.body[field]
//   );

//   if (nonTrimmedField) {
//     return res.status(422).json({
//       code: 422,
//       reason: 'ValidationError',
//       message: 'Cannot start or end with a space',
//       location: nonTrimmedField
//     });
//   }

//   const sizedFields = {

//     userName: {
//       min: 6
//     },
//     password:{
//       min: 8,
//       max: 24
//     }

//   };

//   const tooSmallField = Object.keys(sizedFields).find(
//     field =>
//       'min' in sizedFields[field] &&
//             req.body[field].trim().length < sizedFields[field].min
//   );
//   const tooLargeField = Object.keys(sizedFields).find(
//     field =>
//       'max' in sizedFields[field] &&
//             req.body[field].trim().length > sizedFields[field].max
//   );

//   if (tooSmallField || tooLargeField) {
//     return res.status(422).json({
//       code: 422,
//       reason: 'ValidationError',
//       message: tooSmallField
//         ? `Must be at least ${sizedFields[tooSmallField]
//           .min} characters long`
//         : `Must be at most ${sizedFields[tooLargeField]
//           .max} characters long`,
//       location: tooSmallField || tooLargeField
//     });
//   }

//   let {userName, password, firstName = '', lastName = ''} = req.body;
//   // Username and password come in pre-trimmed, otherwise we throw an error
//   // before this
//   firstName = firstName.trim();
//   lastName = lastName.trim();

//   return UserProfile.find({userName})
//   .count()
//   .then(count => {
//     if(count > 0){
//     return Promise.reject({
//       code: 422,
//       reason: 'ValidationError',
//       message: 'Username already taken',
//       location: 'username'
//     });
//   }
//   return UserProfile.hashPassword(password);
//   })
//   .then(hash => {
//     UserProfile.create({
//       userName: req.body.userName,
//       firstName: req.body.firstName,
//       password: hash,
//       lastName: req.body.lastName
//     });
//   })
//     .then(listing => res.status(201).json(listing)
//     .catch(err => {
//       console.error(err);
//       res.status(500).json({message: 'Failed creating new user'});
//     }))
// });

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
      // bcrypt truncates after 72 characters, so let's not give the illusion
      // of security by storing extra (unused) info
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
      console.log(`${userName} ${firstName} ${lastName} ${email}`)
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
      console.log(err);
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

  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
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
  console.log(databaseUrl);
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, {useNewUrlParser: true}, err => {
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

