'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require("../server.js");
//const faker = require('faker');
//const mongoose = require('mongoose');

//makes 'expect' syntax available
const expect = chai.expect;

//const {UserProfile} = require('../models');
//const {app, runServer, closeServer} = require('../server');
//const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

describe('Get endpoint', function(){
	it('should return status 200 and html', function(){
		//let res;
		return chai.request(app)
		.get("/")
		.then(function(res){
		// 	res = _res;
		 	expect(res).to.have.status(200);
		 	expect(res).to.be.html;
		 });
	});
});