'use strict';

const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const bcrypt = require('bcryptjs');

const userProfileSchema = mongoose.Schema({
	
  	userName: {type: String, required: true, unique: true},
  	firstName: {type: String, required: true},
  	lastName: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
  	created: {type: Date, default: Date.now}
    
},{collection:"userdata"});

const userCommentSchema = mongoose.Schema({
    
    content: {type: String, required: true},
    creator: {type: String , required: true},
    created: {type: Date, required:true, default: Date.now}
});

const phoneNumberSchema = mongoose.Schema({
    
    phoneNumber: {type: Number, required: true},
    flags: {type: Number, required: true},
    description: {type:String, required: true},
    comments: [userCommentSchema],
    created: {type: Date, default: Date.now}

},{collection:"phoneNumberData"});

userProfileSchema.methods.serialize = function(){
  return {
    id: this._id,
    userName: this.userName,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    userComments: this.userComments,
    created: this.created
  };
};
phoneNumberSchema.methods.serialize = function(){
  return{
    id: this._id,
    phoneNumber: this.phoneNumber,
    flags: this.flags,
    description: this.description,
    comments: this.comments,
    created: this.created
  };
};

userCommentSchema.methods.serialize = function(){
  return{
    id: this._id,
    content: this.content,
    creator: this.displayName,
    created: this.created
  };
};

userProfileSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userProfileSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);
const UserComment = mongoose.model('UserComment', userCommentSchema);

module.exports = {UserProfile,PhoneNumber,UserComment};


