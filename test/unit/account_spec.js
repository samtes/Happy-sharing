/*jshint expr:true*/

'use strict';


process.env.DBNAME = 'happy-share-test';
var expect = require('chai').expect;
var Record, User, Account, u1;
var fs = require('fs');
var exec = require('child_process').exec;

describe('User', function(){

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
    u1 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234'});
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
      var u2 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234'});
      u2.register('', function(){
        var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
        expect(a1).to.be.instanceof(Account);
        expect(a1.name).to.equal('rent');
        expect(a1.description).to.equal('sharing the rent of our apartment');
        expect(a1.ownerId.toString()).to.deep.equal(u2._id.toString());
        expect(a1.logics.length).to.equal(1);
        done();
      });
    });
  });

  describe('insert', function(){
    it('should insert account to the db', function(done){
      var u2 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234', role:'member'});
      u2.register('', function(){
        var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
        a1.insert(function(){
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
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
          a1.insert(function(){
            a1.addMember(u3._id.toString(), function(){
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
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
          a1.insert(function(){
            a1.addMember(u3._id.toString(), function(){
              a1.removeMember(u3._id.toString(), function(){
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
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
          a1.insert(function(){
            a1.addMember(u3._id.toString(), function(){
              Account.findById(a1._id.toString(), function(account){
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
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
          var a2 = new Account({name: 'car payment', description:'sharing the car payment', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
          var a3 = new Account({name: 'mortgage', description:'sharing house mortgage', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
          var a4 = new Account({name: 'credit card', description:'sharing credit card', ownerId:u3._id.toString(), members:[u3._id.toString()], balance:[{userId:u3._id.toString(), curBal:0}], logic:[{userId:u3._id.toString(), share:0}]});
          a1.insert(function(){
            a2.insert(function(){
              a3.insert(function(){
                a4.insert(function(){
                  Account.findByUserId(u2._id.toString(), function(accounts){
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

  describe('.findiAll', function(){
    it('should find all the accountsin the db', function(done){
      var u2 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234', role:'member'});
      var u3 = new User({name: 'Bob', email:'bob@nomail.com', password:'1234', role:'member'});
      u2.register('', function(){
        u3.register('', function(){
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
          var a2 = new Account({name: 'car payment', description:'sharing the car payment', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
          var a3 = new Account({name: 'mortgage', description:'sharing house mortgage', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
          var a4 = new Account({name: 'credit card', description:'sharing credit card', ownerId:u3._id.toString(), members:[u3._id.toString()], balance:[{userId:u3._id.toString(), curBal:0}], logic:[{userId:u3._id.toString(), share:0}]});
          a1.insert(function(){
            a2.insert(function(){
              a3.insert(function(){
                a4.insert(function(){
                  Account.findAll(function(accounts){
                    expect(accounts).to.have.length(4);
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

  describe('.notMember', function(){
    it('should find all the users not mebersof an account', function(done){
      var u2 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234', role:'member'});
      var u3 = new User({name: 'Bob', email:'bob@nomail.com', password:'1234', role:'member'});
      u2.register('', function(){
        u3.register('', function(){
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
          a1.insert(function(){
            Account.findById(a1._id.toString(), function(account){
              User.findAll(function(users){
                account.notMembers(users, function(noneMembers){
                  expect(noneMembers).to.have.length(1);
                  done();
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
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
          var a2 = new Account({name: 'mortgage', description:'sharing the mortgage', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
          a1.insert(function(){
            Account.findByMemberId(u2._id.toString(), function(accounts){
              console.log(a2);
              expect(accounts).to.have.length(1);
              done();
            });
          });
        });
      });
    });
  });

  describe('.checkShare', function(){
    it('should check to see if mebers share is set', function(done){
      var u2 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234', role:'member'});
      var u3 = new User({name: 'Bob', email:'bob@nomail.com', password:'1234', role:'member'});
      u2.register('', function(){
        u3.register('', function(){
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
          a1.insert(function(){
            a1.checkShares(function(shares){
              expect(shares).to.have.length(0);
              done();
            });
          });
        });
      });
    });
  });

  describe('.logic', function(){
    it('should set the share amount for the user', function(done){
      var u2 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234', role:'member'});
      var u3 = new User({name: 'Bob', email:'bob@nomail.com', password:'1234', role:'member'});
      u2.register('', function(){
        u3.register('', function(){
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
          a1.insert(function(){
            a1.addMember(u3._id.toString(), function(){
              var id = u3._id.toString();
              var data = {};
              data[id] = '50';
              var id2 = u2._id.toString();
              data[id2] = '50';
              a1.logic(data, function(){
                a1.update(function(){
                  Account.findById(a1._id.toString(), function(account){
                    expect(account).to.be.ok;
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

  describe('.update', function(){
    it('should update the share amount for the user', function(done){
      var u2 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234', role:'member'});
      var u3 = new User({name: 'Bob', email:'bob@nomail.com', password:'1234', role:'member'});
      u2.register('', function(){
        u3.register('', function(){
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
          a1.insert(function(){
            a1.addMember(u3._id.toString(), function(){
              var id = u3._id.toString();
              var data = {};
              data[id] = '50';
              var id2 = u2._id.toString();
              data[id2] = '50';
              a1.logic(data, function(){
                a1.update(function(){
                  Account.findById(a1._id.toString(), function(account){
                    expect(account).to.be.ok;
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

  describe('.updateBalance', function(){
    it('should update the balance of an account', function(done){
      var u2 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234', role:'member'});
      var u3 = new User({name: 'Bob', email:'bob@nomail.com', password:'1234', role:'member'});
      u2.register('', function(){
        u3.register('', function(){
          var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
          a1.insert(function(){
            User.findByAccountId(a1._id.toString(), function(members){
              var r1 = new Record({accountId:a1._id.toString(), date:'03/03/2014', userId:u2._id.toString(), Amount: '200'});
              var data = {paidBy:u2.name, amount:'200', day:new Date(r1.date), members:members, account:a1.name};
              var bal = {userId:u2._id.toString(), amount:'200'};
              r1.insert('', data, function(){
                Account.findById(r1.accountId.toString(), function(account){
                  account.updateBalance(bal, function(){
                    Account.findById(a1._id.toString(), function(returnedAccount){
                      expect(returnedAccount.members).to.have.length(1);
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

  describe('.sendInviteEmail', function(){
    it('should send invitation email to new user', function(done){
      var data = {email:'sweldemariam@nomail.com', message:'Hi sam join happy-share'};
      var u2 = new User({name: 'Sam', email:'sami@nomail.com', password:'1234'});
      u2.register('', function(){
        var a1 = new Account({name: 'rent', description:'sharing the rent of our apartment', ownerId:u2._id.toString(), members:[u2._id.toString()], balance:[{userId:u2._id.toString(), curBal:0}], logic:[{userId:u2._id.toString(), share:0}]});
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
