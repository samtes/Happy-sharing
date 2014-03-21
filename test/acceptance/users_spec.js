/* jshint expr:true */
'use strict';

process.env.DBNAME = 'nodemon-test';
var request = require('supertest');
var fs = require('fs');
var exec = require('child_process').exec;
var app = require('../../app/app');
var expect = require('chai').expect;
var User, u1;
var cookie;

describe('user', function(){

  before(function(done){
    request(app)
    .get('/')
    .end(function(err, res){
      User = require('../../app/models/user');
      done();
    });
  });

  beforeEach(function(done){
    var testdir = __dirname + '/../../app/static/img/users/test*';
    var cmd = 'rm -rf ' + testdir;

    exec(cmd, function(){
      var origfile = __dirname + '/../fixtures/testfile.jpg';
      var copyfile = __dirname + '/../fixtures/testfile-copy.jpg';
      var copyfile1 = __dirname + '/../fixtures/testfiles-copy1.jpg';
      fs.createReadStream(origfile).pipe(fs.createWriteStream(copyfile));
      fs.createReadStream(origfile).pipe(fs.createWriteStream(copyfile1));
      global.nss.db.dropDatabase(function(err, result){
        u1 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234', role:'owner'});
        u1.register('', function(){
          done();
        });
      });
    });
  });

  describe('GET /', function(){
    it('should display the home page', function(done){
      request(app)
      .get('/')
      .expect(200, done);
    });
  });

  describe('GET /register', function(){
    it('should display the register page', function(done){
      request(app)
      .get('/register')
      .expect(200, done);
    });
  });

  describe('POST /register', function(){
    it('should allow a user to register', function(done){
      var filename = __dirname + '/../fixtures/testfile-copy.jpg';
      request(app)
      .post('/register')
      .field('name', 'Sam')
      .field('email', 'sam@nomail.com')
      .field('password', '1234')
      .attach('pic', filename)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });

    it('should not allow a duplicate email to register', function(done){
      var filename = __dirname + '/../fixtures/testfile-copy.jpg';
      request(app)
      .post('/register')
      .field('name', 'Sam')
      .field('email', 'sami@nomail.com')
      .field('password', '1234')
      .attach('pic', filename)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        done();
      });
    });
  });

  describe('GET /login', function(){
    it('should display the login page', function(done){
      request(app)
      .get('/login')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Login');
        done();
      });
    });
  });

  describe('POST /login', function(){
    it('should login a new user and update lastLogin', function(done){
      request(app)
      .post('/login')
      .field('email', 'sami@nomail.com')
      .field('password', '1234')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.text).to.include('Moved Temporarily. Redirecting to /');
        done();
      });
    });

    it('should not login a new user', function(done){
      request(app)
      .post('/login')
      .field('email', 'wrong@nomail.com')
      .field('password', '1234')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Login');
        done();
      });
    });

    it('should not login a new user', function(done){
      request(app)
      .post('/login')
      .field('email', 'sami1@nomail.com')
      .field('password', '12234')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Login');
        done();
      });
    });
  });

  describe('GET /logout', function(){
    it('should log a user out of the app', function(done){
      request(app)
      .get('/logout')
      .expect(302, done);
    });
  });

  describe('AUTHORIZED', function(){
    beforeEach(function(done){
      request(app)
      .post('/login')
      .field('email', 'sami@nomail.com')
      .field('password', '1234')
      .end(function(err, res){
        cookie = res.headers['set-cookie'];
        done();
      });
    });

    describe('GET /users/:id', function(){
      it('should render to the show page', function(done){
        request(app)
        .get('/users/'+ u1._id.toString())
        .set('cookie', cookie)
        .expect(200, done);
      });
    });
  });
});
