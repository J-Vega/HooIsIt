'use strict';

const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const userProfileSchema = mongoose.Schema({
	
  	userName: {type: String, required: true, unique: true},
  	firstName: {type: String, required: true},
  	lastName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
  	created: {type: Date, default: Date.now},
    userComments: [{type:Schema.Types.ObjectId, ref: 'UserComment'}]
},{collection:"userdata"});

const userCommentSchema = mongoose.Schema({
    
    content: {type: String, required: true},
    creator: {type: String , required: true},//[{type: Schema.Types.ObjectId, ref: 'UserProfile'}],
    created: {type: Date, required:true, default: Date.now}
});

const phoneNumberSchema = mongoose.Schema({
    
    phoneNumber: {type: Number, required: true},
    flags: {type: Number, required: true},
    description: {type:String, required: true},
    comments: [userCommentSchema],
    created: {type: Date, default: Date.now}

},{collection:"phoneNumberData"});

// const testCommentSchema = mongoose.Schema({
//     //Not sure if to include required or not - must include user id of person who created it
//     //content: {type:PhoneNumber },
//     created: {type: Date, default: Date.now}
// });

// const testdataSchema = mongoose.Schema({
//   phoneNumber: {type: Number, required: true, unique: true},
//   flags: {type: Number, required: true},
//   description: {type: String, required: true},
//   comments: [{type:String}],
//   created: {type: Date, default: Date.now}
// },{collection:"testdata"});

// userProfileSchema.virtual('virtualDisplayName').get(function() {
//   return `${this.fullName.firstName} ${this.fullName.lastName}`.trim();
// });

// commentSchema.pre('findOne', function(next){
//   this.populate(displayName);
//   next();
// });

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

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);
const UserComment = mongoose.model('UserComment', userCommentSchema)
//const Comment = mongoose.model('Comment', commentSchema);
// const testdata = mongoose.model('testdata', testdataSchema);
// const testcomment = mongoose.model('testcomment', testCommentSchema);

module.exports = {UserProfile,PhoneNumber,UserComment};// testdata, testcomment};


