var express = require('express'); 
var request = require('supertest');
var expect = require('chai').expect;
var app = require('../index');


describe('Mininote server', function() {


  it('Create a notebook POST /api/notebook ', function(done) {
      request(app)
      .post('/api/notebook')
      .send({"id":"pets","password":"202cb962ac59075b964b07152d234b70"})
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201, function(err, res) {
        if (err) { return done(err); }
        callStatus = res.body.id;
        console.dir(callStatus);
        expect(callStatus).to.be.a('string');
        // Done
        done();
      });
  });

});


describe('Mininote server', function() {


  it('Create a notebook POST /api/notebook ', function(done) {
      request(app)
      .post('/api/notebook')      
      .set('Content-Type', 'application/json')
      .send({})
      .expect('Content-Type', /json/)
      .expect(201, function(err, res) {
        if (err) { return done(err); }
        callStatus = res.body.id;
        console.dir(callStatus);
        expect(callStatus).to.be.a('string');
        // Done
        done();
      });
  });

});