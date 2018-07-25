'use strict';

const mongoose = require('mongoose');
//mongoose.Promise = global.Promise;

const userProfileSchema = mongoose.Schema({
	
  	userName: {type: String, required: true},
  	firstName: {type: String, required: true},
  	lastName: {type: String, required: true},
    comments: author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
  	created: {type: Date, default: Date.now}
});

const userContributionSchema = mongoose.Schema({
	
  	userName: {type: String, required: true},
  	firstName: {type: String, required: true},
  	lastName: {type: String, required: true},
  	created: {type: Date, default: Date.now}
});

const commentSchema = mongoose.Schema({
    //Not sure if to include required or not - must include user id of person who created it
    content: {type: String, required: true},
    creator: {type: String, required: true},
    created: {type: Date, default: Date.now}
});

const phoneNumberSchema = mongoose.Schema({
  
    //**** Should I include a requirement for number of digits?
    phoneNumber: {type: Number, required: true},
    flags: {type: Number, required: true},
    comments: [commentSchema],
    created: {type: Date, default: Date.now}
});

const testCommentSchema = mongoose.Schema({
    //Not sure if to include required or not - must include user id of person who created it
    content: String
});

const testdataSchema = mongoose.Schema({
  
    //**** Should I include a requirement for number of digits?
    phoneNumber: Number,
    flags: Number,
    comments: [testCommentSchema]
});
//*******Get is not a function?
// userProfileSchema.virtual('fullName').get(function() {
//   return `${this.fullName.firstName} ${this.fullName.lastName}`.trim();
// });

userProfileSchema.methods.serialize = function() {
  return {
    id: this._id,
    userName: this.userName,
    firstName: this.firstName,
    lastName: this.lastName,
    created: this.created
  };
};

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);
const Comment = mongoose.model('PhoneNumber', phoneNumberSchema);
const testdata = mongoose.model('testdata', testdataSchema);
const testcomment = mongoose.model('testcomment', testCommentSchema);

module.exports = {UserProfile,PhoneNumber,Comment, testdata, testcomment};


