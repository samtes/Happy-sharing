/*jshint expr:true*/

'use strict';


process.env.DBNAME = 'happy-share-test';
var expect = require('chai').expect;
var User, Account, Record;
var fs = require('fs');
var exec = require('child_process').exec;

describe('Record', function(){

  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
      User = require('../../app/models/user');
      Account = require('../../app/models/account');
      Record = require('../../app/models/record');
      done();
    });
  });

  beforeEach(function(done){
    var testdir = __dirname + '/../../app/static/img/users/test*';
    var cmd = 'rm ' + testdir;
    var u1 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234'});
    u1.register('', function(){

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
    it('should create a new record object', function(done){
      var u1 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234'});
      var u2 = new User({name: 'Bob', email:'bob@nomail.com', password:'1234'});
      u1.register('', function(){
        u2.register('', function(){
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u1._id.toString(), members:[u1._id.toString()], balance:[{userId:u1._id.toString(), curBal:0}], logic:[{userId:u1._id.toString(), share:0}]});
          a1.insert(function(){
            a1.addMember(u2._id.toString(), function(){
              var r1 = new Record({accountId:a1._id.toString(), date:'03/03/2014', userId:u1._id.toString(), Amount: '200'});
              expect(r1).to.be.instanceof(Record);
              expect(r1.date).to.be.instanceof(Date);
              expect(r1.accountId).to.deep.equal(a1._id);
              done();
            });
          });
        });
      });
    });
  });

  describe('.insert', function(){
    it('should insert record to the db', function(done){
      var u1 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234'});
      var u2 = new User({name: 'Bob', email:'bob@nomail.com', password:'1234'});
      u1.register('', function(){
        u2.register('', function(){
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
          a1.insert(function(){
            a1.addMember(u2._id.toString(), function(){
              var r1 = new Record({accountId:a1._id.toString(), date:'03/03/2014', userId:u1._id.toString(), Amount: '200'});
              r1.insert('', '', function(){
                expect(a1._id.toString()).to.have.length(24);
                expect(r1.date).to.be.instanceof(Date);
                expect(r1.accountId).to.deep.equal(a1._id);
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('#findByAccountId', function(){
    it('should find all records by accountId', function(done){
      var u1 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234'});
      var u2 = new User({name: 'Bob', email:'bob@nomail.com', password:'1234'});
      u1.register('', function(){
        u2.register('', function(){
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
          a1.insert(function(){
            a1.addMember(u2._id.toString(), function(){
              var r1 = new Record({accountId:a1._id.toString(), date:'03/03/2014', userId:u1._id.toString(), Amount: '200'});
              var r2 = new Record({accountId:a1._id.toString(), date:'03/12/2014', userId:u1._id.toString(), Amount: '300'});
              var r3 = new Record({accountId:a1._id.toString(), date:'03/20/2014', userId:u1._id.toString(), Amount: '100'});
              r1.insert('', '', function(){
                r2.insert('', '', function(){
                  r3.insert('', '', function(){
                    Record.findByAccountId(a1._id.toString(), function(accounts){
                      expect(accounts).to.have.length(3);
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

  describe('#findByUserId', function(){
    it('should find all records by userId', function(done){
      var u1 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234'});
      var u2 = new User({name: 'Bob', email:'bob@nomail.com', password:'1234'});
      u1.register('', function(){
        u2.register('', function(){
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
          a1.insert(function(){
            a1.addMember(u2._id.toString(), function(){
              var r1 = new Record({accountId:a1._id.toString(), date:'03/03/2014', userId:u1._id.toString(), Amount: '200'});
              var r2 = new Record({accountId:a1._id.toString(), date:'03/12/2014', userId:u2._id.toString(), Amount: '300'});
              var r3 = new Record({accountId:a1._id.toString(), date:'03/20/2014', userId:u1._id.toString(), Amount: '100'});
              r1.insert('', '', function(){
                r2.insert('', '', function(){
                  r3.insert('', '', function(){
                    Record.findByUserId(u1._id.toString(), function(accounts){
                      expect(accounts).to.have.length(2);
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

  describe('#findById', function(){
    it('should find all records by userId', function(done){
      var u1 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234', role:'member'});
      var u2 = new User({name: 'Bob', email:'bob@nomail.com', password:'1234', role:'member'});
      u1.register('', function(){
        u2.register('', function(){
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
          a1.insert(function(){
            a1.addMember(u2._id.toString(), function(){
              var r1 = new Record({accountId:a1._id.toString(), date:'03/03/2014', userId:u1._id.toString(), Amount: '200'});
              var r2 = new Record({accountId:a1._id.toString(), date:'03/12/2014', userId:u2._id.toString(), Amount: '300'});
              var r3 = new Record({accountId:a1._id.toString(), date:'03/20/2014', userId:u1._id.toString(), Amount: '100'});
              r1.insert('', '', function(){
                r2.insert('', '', function(){
                  r3.insert('', '', function(){
                    Record.findById(r1._id.toString(), function(record){
                      expect(record.accountId.toString()).to.be.deep.equal(a1._id.toString());
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
