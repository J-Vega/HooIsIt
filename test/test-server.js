'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const {app, closeServer, runServer} = require("../server.js");
//const closeServer = require('../server.js');
//const runServer = require('../server.js');

//makes 'expect' syntax available
const expect = chai.expect;

const {PhoneNumber , UserProfile} = require('../models.js');

const {TEST_DATABASE_URL} = require('../config.js');

chai.use(chaiHttp);

function seedPhoneNumberData() {
	const testData = [];

	for(let i = 1; i <= 5; i++){
		testData.push(generatePhoneNumberData());
	}
	//console.log("Adding test data");
	return PhoneNumber.insertMany(testData);
}

function seedUserData() {
	const testData = [];

	for(let i = 1; i <= 5; i++){
		testData.push(generateUserData());
	}
	//console.log("Adding test data");
	return UserProfile.insertMany(testData);
}

function generatePhoneNumberData(){
	var phoneNumber = faker.phone.phoneNumberFormat();
	var wholeNumber = parseInt(phoneNumber,10);
	console.log(phoneNumber + wholeNumber);
	return{
		phoneNumber: phoneNumber.replace(/[^\d]/g,''),
    	flags: 1,
    	description: "Fake call posing as " + faker.company.companyName(),
    	comments: {
    		content: "Fake content",
    		creator: "Author"
    	},
    	created: faker.date.past()
	}
}

function generateUserData(){
	var userName = "user"+faker.random.word();
	var firstName = faker.name.firstName();
	var lastName = faker.name.lastName();
  var password = "abcd123456";
	var email = faker.random.word()+"@"+faker.random.word()+".com";

	return{
		userName: userName,
    	firstName: firstName,
    	lastName: lastName,
    	email: email,
      password: password,
    	comments: [],
    	created: faker.date.past()
	}
}

function tearDownDb() {
	//console.warn('Deleting database');
	return mongoose.connection.db.dropDatabase();
}


describe('Phone number API resource', function(){

	before(function() {
    	return runServer(TEST_DATABASE_URL, 8081);
  	});

	beforeEach(function() {
  		return seedPhoneNumberData();
  	});

  	 	afterEach(function() {
  		return tearDownDb();
  	});

  	 	after(function() {
    	return closeServer();
  	});

	describe('Get endpoint', function(){

		it('should return all existing phone numbers', function(){
		
		let res;
		return chai.request(app)
		.get("/list")
		.then(function(_res){
			res = _res;
			//console.log(res.body);
		 	expect(res).to.have.status(200);
		 	expect(res.body).to.have.lengthOf.at.least(1);
		 	//console.log(phoneNumberData.count);
		 	return PhoneNumber.count();
		})
		.then(function(count){
			expect(res.body).to.have.lengthOf(count);
		});
		})
	});

	describe('POST endpoint', function() {

    	it('should add a new phone number', function() {

      const newListing = generatePhoneNumberData();
      //console.log(newListing);

      return chai.request(app)
        .post('/list')
        .send(newListing)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys(
            '_id', 'phoneNumber', 'comments', 'description');
          //Serialized model - id -vs actual model - _id -
          // Mongo should have 
          expect(res.body.id).to.not.be.null;
          expect(res.body.description).to.equal(newListing.description);
          //console.log(PhoneNumber.findById(res.body._id));
          return PhoneNumber.findById(res.body._id);
        })
        .then(function(listing) {
        	//console.log("Listing below:");
          	expect(`${listing.phoneNumber}`).to.equal(newListing.phoneNumber);
          	expect(listing.flags).to.equal(newListing.flags);
          	expect(listing.description).to.equal(newListing.description);
        });
    	});
  	});

	// describe('PUT endpoint', function() {

 //    // strategy:
 //    //  1. Get an existing phone number from db
 //    //  2. Make a PUT request to update that phone number
 //    //  3. Push new comment into phone numbers comment array
 //    //  3. Prove phone number contains comment we sent (last comment in array equals comment sent)
 //    it('should add a new comment to the selected phone number', function() {
 //      const updateData = {
 //        comment: "New comment from test script!"
 //      };

 //      return PhoneNumber
 //        .findOne()
 //        .then(function(listing) {
 //          updateData.id = restaurant.id;

 //          // make request then inspect it to make sure it reflects
 //          // data we sent
 //          return chai.request(app)
 //            .put(`/list/${restaurant.id}`)
 //            .send(updateData);
 //        })
 //        .then(function(res) {
 //          expect(res).to.have.status(204);

 //          return Restaurant.findById(updateData.id);
 //        })
 //        .then(function(listing) {
 //          //expect(restaurant.name).to.equal(updateData.name);
 //          //expect(restaurant.cuisine).to.equal(updateData.cuisine);
 //        });
 //    });
 //  });
	

	describe('DELETE endpoint', function() {
   
    	it('delete a phone number by id', function() {

      		let phoneNumber;

      		return PhoneNumber
        	.findOne()
        	.then(function(_phoneNumber) {
          		phoneNumber = _phoneNumber;
          		return chai.request(app).delete(`/list/${phoneNumber.id}`);
        	})
        	.then(function(res) {
          		expect(res).to.have.status(204);
          		return PhoneNumber.findById(phoneNumber.id);
        	})
        	.then(function(_phoneNumber) {
          		expect(_phoneNumber).to.be.null;
        	});
    	});
  	});
});//End of phone Number API Resource


describe('User data API resource', function(){

	before(function() {
    	return runServer(TEST_DATABASE_URL, 8081);
  	});

	beforeEach(function() {
  		return seedUserData();
  	});

  	 	afterEach(function() {
  		return tearDownDb();
  	});

  	 	after(function() {
    	return closeServer();
  	});

	describe('GET endpoint', function() {
		it('should return all existing users', function(){
		
			let res;
			return chai.request(app)
			.get("/users")
			.then(function(_res){
				res = _res;
				//console.log(res.body);
		 		expect(res).to.have.status(200);
		 		expect(res.body).to.have.lengthOf.at.least(1);
		 		//console.log(phoneNumberData.count);
		 		return UserProfile.count();
			})
			.then(function(count){
			expect(res.body).to.have.lengthOf(count);
			});
		});
	});

	describe('POST endpoint', function() {

    	it('should add a new user', function() {

      		const newUser = generateUserData();

      		return chai.request(app)
        	.post('/users')
        	.send(newUser)
        	.then(function(res) {
          		expect(res).to.have.status(201);
          		expect(res).to.be.json;
          		expect(res.body).to.be.a('object');
          		expect(res.body).to.include.keys(
            		'id','userName', 'firstName', 'lastName');//, 'email');
          			//Serialized model - id -vs actual model - _id -
         		expect(res.body.id).to.not.be.null;
          		expect(res.body.userName).to.equal(newUser.userName);
          		expect(res.body.firstName).to.equal(newUser.firstName);
          		expect(res.body.lastName).to.equal(newUser.lastName);
              expect(res.body.password).to.not.equal(null);
          		//expect(res.body.email).to.equal(newUser.email);
          	return UserProfile.findById(res.body.id);
        })
        .then(function(listing) {
        	//console.log("Listing below:");
          	expect(listing.userName).to.equal(newUser.userName);
          	expect(listing.firstName).to.equal(newUser.firstName);
          	expect(listing.lastName).to.equal(newUser.lastName);
            expect(listing.password).to.not.equal(null);
          	//expect(listing.email).to.equal(newUser.email);
        });
    	});
  	});

  	describe('PUT endpoint', function() {
  		it('should update user personal info', function() {
      		const updateData = {
        		firstName: 'NewFirstName',
        		lastName: 'NewLastName',
      		};

      return UserProfile
        .findOne()
        .then(function(user) {
          updateData.id = user.id;

          // make request then inspect it to make sure it reflects
          // data we sent
          return chai.request(app)
            .put(`/users/${user.id}`)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(204);

          return UserProfile.findById(updateData.id);
        })
        .then(function(user) {
          expect(user.firstName).to.equal(updateData.firstName);
          expect(user.lastName).to.equal(updateData.lastName);
        });
    });
  	});

	describe('DELETE endpoint', function() {
   
    	it('delete a user by id', function() {

     	 	let user;

     		return UserProfile
        	.findOne()
        	.then(function(_user){
        		user = _user;
          		return chai.request(app).delete(`/users/${user.id}`);
        	})
        	.then(function(res) {
          		expect(res).to.have.status(204);
          		return UserProfile.findById(user.id);
        	})
        	.then(function(_user) {
          	expect(_user).to.be.null;
        	});
    	});
	});

});
//End of phone number API resource




