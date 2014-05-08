'use strict';


module.exports = Account;

var accounts = global.nss.db.collection('accounts');
var Mongo = require('mongodb');
var email = require('../lib/email');
var _ = require('lodash');
var User = require('./user');


function Account(account){
  this.name = account.name;
  this.description = account.description;
  this.ownerId = Mongo.ObjectID(account.ownerId);
  this.members = [account.ownerId];
  this.balance = [account.balance];
  this.logics = [account.logic];
}

Account.prototype.insert = function(fn){
  accounts.insert(this, function(err, record){
    fn();
  });
};

Account.prototype.update = function(fn){
  accounts.update({_id:this._id}, this, function(err, count){
    fn(count);
  });
};

Account.prototype.addMember = function(memberId, fn){
  var self = this;
  User.findById(memberId, function(user){
    if(user){
      user.accounts.push(self._id.toString());
      user.update(function(){});
      var bal = {userId:memberId, curBal: 0};
      self.balance.push(bal);
      var logic = {userId:memberId, share: 0};
      self.logics.push(logic);
      self.members.push(memberId);
      self.members = _.uniq(self.members);
      updateInsert(self, function(count){
        if(count){
          email.addedToAccount({to:user.email, name:user.name, account:self.name}, function(err, body){
            fn(err, body);
          });
        }else{
          fn();
        }
      });
    } else {
      fn();
    }
  });
};

Account.prototype.notMembers = function(users, fn){
  var self = this;
  var notMembers =  _.difference(_.map(users, function(user){
    return user._id.toString();
  }), self.members);
  fn(notMembers);
};

Account.prototype.checkShares = function(fn){
  var state = _.where(this.logics, {'share': 0});
  fn(state);
};

Account.prototype.removeMember = function(memberId, fn){
  var self = this;
  if (memberId === self.ownerId.toString()){
    fn();
  } else {
    _.remove(self.members, function(record){
      return record === memberId;
    });
    _.remove(self.balance, function(record){
      return record.userId === memberId;
    });
    _.remove(self.logics, function(record){
      return record.userId === memberId;
    });
    fn(memberId);
  }
};

Account.findAll = function(fn){
  accounts.find().toArray(function(err, records){
    fn(records);
  });
};

Account.findById = function(id, fn){
  var _id = Mongo.ObjectID(id);
  accounts.findOne({_id:_id}, function(err, record){
    fn(_.extend(record, Account.prototype));
  });
};

Account.findByMemberId = function(id, fn){
  accounts.find({members:id}).toArray(function(err, records){
    fn(records);
  });
};

Account.sendInviteEmail = function(data, fn){
  email.inviteMember({to:data.email, message:data.message}, function(err, body){
    fn(err, body);
  });
};

Account.findByUserId = function(id, fn){
  var ownerId = Mongo.ObjectID(id);
  accounts.find({ownerId:ownerId}).toArray(function(err, records){
    console.log(records);
    fn(records);
  });
};

Account.prototype.logic = function(data, fn){
  var self = this;
  var ids = Object.keys(data);
  cleanLogic(ids, data, function(newShare){
    self.logics = newShare;
    fn();
  });
};

function cleanLogic(idsArr, existingObj, fn) {
  var test =  _.map(idsArr, function(id){
    return {userId: id, share: existingObj[id] * 1};
  });
  fn(test);
}

Account.prototype.updateBalance = function(data, fn){
  var self = this;
  setBalance(self.logics, self.balance, self.members, data, function(){
    updateInsert(self, function(count){
      fn();
    });
  });
};

function setBalance(logics, balance, members, payment, fn){
  _.map(balance, function(each){
    if (each.userId === payment.userId){
      findShare(logics, each, function(share){
        each.curBal = (each.curBal * 1) + ((payment.amount * 1) - (payment.amount * share / 100));
      });
    } else {
      findShare(logics, each, function(share){
        each.curBal = (each.curBal * 1) - (payment.amount * share / 100);
      });
    }
  });
  fn();
}

function findShare(shares, payment, fn){
  _.map(shares, function(share){
    if (share.userId === payment.userId){
      fn(share.share);
    }
  });
}

function updateInsert(account, fn){
  accounts.update({_id:account._id}, account, function(err, count){
    fn(count);
  });
}

