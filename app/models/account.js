'use strict';


module.exports = Account;

//var bcrypt = require('bcrypt');
//var path = require('path');
//var fs = require('fs');
var users = global.nss.db.collection('users');
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
  this.update = [];
  this.logics = [] ;
}

Account.prototype.insert = function(fn){
  accounts.insert(this, function(err, record){
    fn();
  });
};

function updateInsert(account, fn){
  accounts.update({_id:account._id}, account, function(err, count){
    fn(count);
  });
}

Account.prototype.addMember = function(memberId, fn){
  var self = this;
  User.findById(memberId, function(user){
    if(user){
      user.accounts.push(self._id.toString());
      user.update(function(){});
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

Account.prototype.removeMember = function(memberId, fn){
  var self = this;
  var _id = Mongo.ObjectID(memberId);
  users.findOne({_id:_id}, function(err, user){
    if(user){
      _.remove(self.members, function(member){
        return member === memberId;
      });
      updateInsert(self, function(record){
        if(record){
          email.removedAccount({to:user.email, name:user.name, account:self.name}, function(err, body){
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

Account.prototype.payment = function(data, paidBy, account, users, fn){
  var self = this;
  self.update.push(data);
  updateInsert(self, function(count){
    var emailData = {amount:data.amount, paidBy:paidBy.name};
    getEmails(users, emailData, function(){
      fn(count);
    });
  });
};

function getEmails(users, data, fn){
  _.map(users, function(user){
    return sendPaymentEmail(user.email, data, function(){
    });
  });
  fn();
}

function sendPaymentEmail(toEmail, data, fn){
  email.paymentMade({to:toEmail, amount:data.amount, paidBy:data.name}, function(err, body){
    fn(err, body);
  });
}

Account.findByUserId = function(id, fn){
  var ownerId = Mongo.ObjectID(id);
  accounts.find({ownerId:ownerId}).toArray(function(err, records){
    console.log(records);
    fn(records);
  });
};

Account.prototype.logic = function(data, fn){
  var self = this;
  self.logics = [];
  self.logics.push(data);
  updateInsert(self, function(count){
    fn(count);
  });
};


