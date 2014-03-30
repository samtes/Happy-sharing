/* jshint expr:true */
'use strict';

process.env.DBNAME = 'nodemon-test';
var request = require('supertest');
var fs = require('fs');
var exec = require('child_process').exec;
var app = require('../../app/app');
var expect = require('chai').expect;
var User, Account, u1, u2, a1, a2, a3;
var cookie;

describe('account', function(){

  before(function(done){
    request(app)
    .get('/')
    .end(function(err, res){
      User = require('../../app/models/user');
      Account = require('../../app/models/account');
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
        u2 = new User({name: 'Sam', email:'samooi@nomail.com', password:'1234', role:'owner'});
        u1.register('', function(){
          u2.register('', function(){
            a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u1._id.toString(), members:[], logic:'0', update:[]});
            a2 = new Account({name: 'rent 2', description:'sharing the rent of our apartment 2', ownerId:u1._id.toString(), members:[], logic:'0', update:[]});
            a3 = new Account({name: 'rent 3', description:'sharing the rent of our apartment 3', ownerId:u1._id.toString(), members:[], logic:'0', update:[]});
            a1.insert(function(){
              a2.insert(function(){
                a3.insert(function(){
                  request(app)
                  .post('/login')
                  .field('email', 'sami@nomail.com')
                  .field('password', '1234')
                  .end(function(err, res){
                    cookie = res.headers['set-cookie'];
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  describe('GET /accounts', function(){
    it('should display the accounts index page', function(done){
      request(app)
      .get('/accounts')
      .set('cookie', cookie)
      .expect(200, done);
    });
  });

  describe('GET /accounts/new', function(){
    it('should display new account page', function(done){
      request(app)
      .get('/accounts/new')
      .set('cookie', cookie)
      .expect(200, done);
    });
  });

  describe('POST /accounts', function(){
    it('should allow a user to register', function(done){
      request(app)
      .post('/accounts')
      .field('name', 'Rent')
      .field('description', 'this is rent share')
      .field('ownerId', u1._id.toString())
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });

  describe('GET /accounts/:id', function(){
    it('should display the account page', function(done){
      request(app)
      .get('/accounts/'+a1._id.toString())
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });

  describe('GET /accounts/members/:id', function(){
    it('should display the account members page', function(done){
      request(app)
      .get('/accounts/members/'+a1._id.toString())
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });

  describe('POST /accounts/:id', function(){
    it('should send invitation email to unregistered user', function(done){
      request(app)
      .post('/accounts/'+a1._id.toString())
      .field('email', 'sami@nomail.com')
      .field('message', 'Hi this is Sam')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });

  describe('POST /accounts/member/:id', function(){
    it('should add a member to an account', function(done){
      request(app)
      .post('/accounts/member/'+a1._id.toString())
      .field('member', u2._id.toString())
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });

  describe('POST /accounts/logic/:id', function(){
    it('should set the share of members for an account', function(done){
      request(app)
      .post('/accounts/logic/'+a1._id.toString())
      .field('1234', '50')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });
/*

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
  */
});
