/*jshint expr:true*/

'use strict';


process.env.DBNAME = 'happy-share-test';
var expect = require('chai').expect;
var User, Account, u1;
var fs = require('fs');
var exec = require('child_process').exec;

describe('User', function(){

  before(function(done){
    var initMongo = require('../../app/lib/init-mongo');
    initMongo.db(function(){
      User = require('../../app/models/user');
      Account = require('../../app/models/account');
      done();
    });
  });

  beforeEach(function(done){
    var testdir = __dirname + '/../../app/static/img/users/test*';
    var cmd = 'rm ' + testdir;
    u1 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234', role:'member'});
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
    it('should create a new Account object', function(done){
      var u2 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234', role:'member'});
      u2.register('', function(){
        var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[], logic:'0', update:[]});
        console.log('First This is the u2', u2);
        console.log('First This is the a1', a1);
        expect(a1).to.be.instanceof(Account);
        expect(a1.name).to.equal('rent');
        expect(a1.description).to.equal('sharing the rent of our apartment');
        expect(a1.ownerId.toString()).to.deep.equal(u2._id.toString());
        expect(a1.logics.length).to.deep.equal(0);
        done();
      });
    });
  });

  describe('insert', function(){
    it('should insert account to the db', function(done){
      var u2 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234', role:'member'});
      u2.register('', function(){
        var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[], logic:'0', update:[]});
        a1.insert(function(){
          console.log('Second This is the u2', u2);
          console.log('Second This is the a1', a1);
          expect(a1._id.toString()).to.have.length(24);
          expect(a1.ownerId.toString()).to.deep.equal(u2._id.toString());
          expect(a1.name).to.be.equal('rent');
          expect(a1.description).to.be.equal('sharing the rent of our apartment');
          expect(a1.ownerId.toString()).to.have.length(24);
          done();
        });
      });
    });
  });

  describe('add member', function(){
    it('should insert a member to the members array', function(done){
      var u2 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234', role:'member'});
      var u3 = new User({name: 'Bob', email:'bob@nomail.com', password:'1234', role:'member'});
      u2.register('', function(){
        u3.register('', function(){
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[], logic:'0', update:[]});
          a1.insert(function(){
            a1.addMember(u3._id.toString(), function(){
              console.log('Second This is the a1', a1);
              expect(a1.members).to.have.length(2);
              done();
            });
          });
        });
      });
    });
  });

  describe('remove member', function(){
    it('should remove a member to the members array', function(done){
      var u2 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234', role:'member'});
      var u3 = new User({name: 'Bob', email:'bob@nomail.com', password:'1234', role:'member'});
      u2.register('', function(){
        u3.register('', function(){
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[], logic:'0', update:[]});
          a1.insert(function(){
            a1.addMember(u3._id.toString(), function(){
              console.log('a1 before remove', a1);
              a1.removeMember(u3._id.toString(), function(){
                console.log('a1 after remove', a1);
                expect(a1.members).to.have.length(1);
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('.findbyId', function(){
    it('should find an account by id', function(done){
      var u2 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234', role:'member'});
      var u3 = new User({name: 'Bob', email:'bob@nomail.com', password:'1234', role:'member'});
      u2.register('', function(){
        u3.register('', function(){
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[], logic:'0', update:[]});
          a1.insert(function(){
            a1.addMember(u3._id.toString(), function(){
              Account.findById(a1._id.toString(), function(account){
                console.log('THIS IS THE ACCOUNT RETURNED', account);
                expect(account.members).to.have.length(2);
                expect(account.name).to.be.equal('rent');
                expect(account.description).to.be.equal('sharing the rent of our apartment');
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('.findByUserId', function(){
    it('should find all the accounts by user id', function(done){
      var u2 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234', role:'member'});
      var u3 = new User({name: 'Bob', email:'bob@nomail.com', password:'1234', role:'member'});
      u2.register('', function(){
        u3.register('', function(){
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[], logic:'0', update:[]});
          var a2 = new Account({name: 'car payment', description:'sharing the car payment', ownerId:u2._id.toString(), members:[], logic:'0', update:[]});
          var a3 = new Account({name: 'mortgage', description:'sharing house mortgage', ownerId:u2._id.toString(), members:[], logic:'0', update:[]});
          var a4 = new Account({name: 'credit card', description:'sharing credit card', ownerId:u3._id.toString(), members:[], logic:'0', update:[]});
          a1.insert(function(){
            a2.insert(function(){
              a3.insert(function(){
                a4.insert(function(){
                  Account.findByUserId(u2._id.toString(), function(accounts){
                    console.log('THESE ARE THE ACCOUNTS RETURNED', accounts);
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

  describe('.findByMemberId', function(){
    it('should find all the accounts by user id', function(done){
      var u2 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234', role:'member'});
      var u3 = new User({name: 'Bob', email:'bob@nomail.com', password:'1234', role:'member'});
      u2.register('', function(){
        u3.register('', function(){
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[u2._id], logics:[], update:[]});
          var a2 = new Account({name: 'mortgage', description:'sharing the mortgage', ownerId:u2._id.toString(), members:[u2._id], logics:[], update:[]});
          a1.insert(function(){
            Account.findByMemberId(u2._id.toString(), function(accounts){
              console.log('THESE ARE THE ACCOUNTS RETURNED', accounts, a2);
              expect(accounts).to.have.length(1);
              done();
            });
          });
        });
      });
    });
  });

  describe('.sendInviteEmail', function(){
    it('should send invitation email to new user', function(done){
      var data = {email:'sweldemariam@nomail.com', message:'Hi sam join happy-share'};
      var u2 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234', role:'member'});
      u2.register('', function(){
        var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[], logic:'0', update:[]});
        a1.insert(function(){
          Account.sendInviteEmail(data, function(err, body){
            expect(body).to.be.undefined;
            done();
          });
        });
      });
    });
  });
});
