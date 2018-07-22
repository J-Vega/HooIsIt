'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userProfileSchema = mongoose.Schema({
	
	fullName: {
    	firstName: String,
    	lastName: String
  	},
  	userName: {type: String, required: true}
});

userProfileSchema.virtual('fullName').get(function() {
  return `${this.fullName.firstName} ${this.fullName.lastName}`.trim();
});

userProfileSchema.methods.serialize = function() {
  return {
    id: this._id,
    fullName: this.fullName,
    userName: this.userName,
    created: this.created
  };
};

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = {UserProfile};