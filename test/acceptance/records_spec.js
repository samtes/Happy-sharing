/* jshint expr:true */
'use strict';

process.env.DBNAME = 'nodemon-test';
var request = require('supertest');
var fs = require('fs');
var exec = require('child_process').exec;
var app = require('../../app/app');
var expect = require('chai').expect;
var User, Account, Record, u1, u2, a1, a2, a3, r1, data, bal;
var cookie;

describe('record', function(){

  before(function(done){
    request(app)
    .get('/')
    .end(function(err, res){
      User = require('../../app/models/user');
      Account = require('../../app/models/account');
      Record = require('../../app/models/record');
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
            a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u1._id.toString(), members:[u1._id.toString()], balance:[{userId:u1._id.toString(), curBal:0}], logic:[{userId:u1._id.toString(), share:0}]});
            a2 = new Account({name: 'rent 2', description:'sharing the rent our appartment 2', ownerId:u1._id.toString(), members:[u1._id.toString()], balance:[{userId:u1._id.toString(), curBal:0}], logic:[{userId:u1._id.toString(), share:0}]});
            a3 = new Account({name: 'rent 3', description:'sharing the rent of our appartment 3', ownerId:u1._id.toString(), members:[u1._id.toString()], balance:[{userId:u1._id.toString(), curBal:0}], logic:[{userId:u1._id.toString(), share:0}]});
            a1.insert(function(){
              a2.insert(function(){
                a3.insert(function(){
                  User.findByAccountId(a1._id.toString(), function(members){
                    r1 = new Record({accountId:a1._id.toString(), date:'03/03/2014', userId:u2._id.toString(), Amount: '200'});
                    data = {paidBy:u2.name, amount:'200', day:new Date(r1.date), members:members, account:a1.name};
                    bal = {userId:u2._id.toString(), amount:'200'};
                    r1.insert('', data, function(){
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
    });
  });

  describe('GET /records/:id', function(){
    it('should display the record record detail page', function(done){
      request(app)
      .get('/records/'+r1._id.toString())
      .set('cookie', cookie)
      .expect(200, done);
    });
  });

  describe('POST /records/new/:id', function(){
    it('should create a new record redirect to the account show page', function(done){
      request(app)
      .post('/records/new/'+a1._id.toString())
      .field('date', r1.date)
      .field('accountId', a1._id.toString())
      .field('userId', u2._id.toString())
      .field('amount', r1.amount)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        done();
      });
    });
  });
});
