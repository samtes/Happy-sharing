/*jshint expr:true*/

'use strict';


process.env.DBNAME = 'happy-share-test';
var expect = require('chai').expect;
var User;
var fs = require('fs');
var exec = require('child_process').exec;

describe('User', function(){

  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
      User = require('../../app/models/user');
      done();
    });
  });

  beforeEach(function(done){
    var testdir = __dirname + '/../../app/static/img/users/test*';
    var cmd = 'rm ' + testdir;
    var u1 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234', role:'owner'});
    u1.register(function(){

      exec(cmd, function(){
        var origfile = __dirname + '/../fixtures/testfile.jpg';
        var copyfile = __dirname + '/../fixtures/testfile-copy.jpg';
        var copyfile2 = __dirname + '/../fixtures/testfile2-copy.jpg';
        fs.createReadStream(origfile).pipe(fs.createWriteStream(copyfile));
        fs.createReadStream(origfile).pipe(fs.createWriteStream(copyfile2));
        global.nss.db.dropDatabase(function(err, result){
          done();
        });
      });
    });
  });

  describe('new', function(){
    it('should create a new User object', function(done){
      var u1 = new User({name: 'Sam', email:'sam@nomail.com', password:'1234', role:'owner'});
      expect(u1.email).to.equal('sam@nomail.com');
      expect(u1.password).to.equal('1234');
      expect(u1.role).to.equal('owner');
      expect(u1.name).to.equal('Sam');
      done();
    });
  });

  describe('register', function(){
    it('should register user', function(done){
      var u1 = new User({name: 'Sam', email:'sam@nomail.com', password:'1234', role:'owner'});
      u1.register(function(){
        expect(u1.email).to.equal('sam@nomail.com');
        expect(u1.password).to.not.equal('1234');
        expect(u1.role).to.equal('owner');
        expect(u1.name).to.equal('Sam');
        done();
      });
    });

    it('should not register a user to the database for duplicate email', function(done){
      var u1 = new User({name: 'Sam', email:'sam@nomail.com', password:'1234', role:'owner'});
      var u2 = new User({name: 'Jim', email:'sam@nomail.com', password:'1234', role:'owner'});
      u1.register(function(){
        u2.register(function(){
          expect(u1.password).to.not.equal('1234');
          expect(u2.password).to.not.equal('1234');
          expect(u1._id.toString()).to.have.length(24);
          expect(u2._id).to.not.be.ok;
          done();
        });
      });
    });
  });

  describe('.findById', function(){
    it('should find a user by id', function(done){
      var u1 = new User({name: 'Sam', email:'sam@nomail.com', password:'1234', role:'owner', pic: '/data/code/happy-sharing/test/fixtures/testfile-copy.jpg'});
      u1.register(function(){
        User.findById(u1._id.toString(), function(record){
          expect(u1.pic).to.equal('/img/users/testfile-copy.jpg');
          expect(u1.email).to.equal('sam@nomail.com');
          expect(u1.password).to.not.equal('1234');
          expect(u1.role).to.equal('owner');
          expect(record.name).to.equal('Sam');
          expect(record._id).to.deep.equal(u1._id);
          done();
        });
      });
    });
  });
});
