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

const {PhoneNumber} = require('../models.js');

const {TEST_DATABASE_URL} = require('../config.js');

chai.use(chaiHttp);

function seedPhoneNumberData() {
	const testData = [];

	for(let i = 1; i <= 10; i++){
		testData.push(generatePhoneNumberData());
	}
	//console.log("Adding test data");
	return PhoneNumber.insertMany(testData);
}

function generatePhoneNumberData(){
	var phoneNumber = faker.phone.phoneNumberFormat();
	console.log(phoneNumber);
	return{
		phoneNumber: phoneNumber.replace(/[^\d]/g,''),
    	flags: 1,
    	description: "Fake call posing as " + faker.company.companyName(),
    	comments: ["Fake comment"],
    	created: faker.date.past()
	}
}

function tearDownDb() {
	console.warn('Deleting database');
	return mongoose.connection.db.dropDatabase();
}

describe('Phone number API resource', function(){
	
	
	before(function() {
		console.log(TEST_DATABASE_URL);
    	return runServer(TEST_DATABASE_URL, 8081);

  	});

  	beforeEach(function() {
  		return seedPhoneNumberData();
  	});

  	afterEach(function() {
  		return tearDownDb();
  	});

	after(function() {
		console.log("closing server");
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

// describe('POST endpoint', function() {

//     it('should add a new phone number', function() {

//       const newListing = generatePhoneNumberData();

//       return chai.request(app)
//         .post('/list')
//         .send(newListing)
//         .then(function(res) {
//           expect(res).to.have.status(201);
//           expect(res).to.be.json;
//           expect(res.body).to.be.a('object');
//           expect(res.body).to.include.keys(
//             'id', 'phoneNumber', 'comments', 'flags', 'description');
//           //expect(res.body.name).to.equal(newListing.name);
//           // cause Mongo should have created id on insertion
//           expect(res.body.id).to.not.be.null;
//           expect(res.body.description).to.equal(newListing.description);
          
//           return PhoneNumber.findById(res.body.id);
//         })
//         .then(function(listing) {
//           expect(listing.phoneNumber).to.equal(newListing.phoneNumber);
//           expect(listing.flags).to.equal(newListing.flags);
//           expect(listing.description).to.equal(newListing.description);

//         });
//     });
//   });
	

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

});//End



