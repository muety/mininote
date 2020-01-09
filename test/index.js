const fs = require('fs')
  path = require('path'),
  config = require('../config'),
  request = require('supertest'),
  expect = require('chai').expect,
  app = require('../index');

describe('Mininote server', function() {
  
  afterEach(function(done) {
    try {
      fs.unlinkSync(path.resolve(config.DB_FILE))
      fs.unlinkSync(path.resolve(config.DB_FILE + '.0'))
    } catch(e) {
    } finally {
      done()
    }
  })

  it('Create a notebook POST /api/notebook ', function(done) {
      request(app)
      .post('/api/notebook')
      .send({"id":"pets","password":"202cb962ac59075b964b07152d234b70"})
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201, function(err, res) {
        if (err) { return done(err); }
        callStatus = res.body.id;
        expect(callStatus).to.be.a('string');
        done();
      });
  });

});