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


function Account(account){
  this.name = account.name;
  this.description = account.description;
  this.ownerId = Mongo.ObjectID(account.ownerId);
  this.members = [this.ownerId];
  this.update = [];
  this.logic = account.logic;
}

Account.prototype.insert = function(fn){
  accounts.insert(this, function(err, record){
    fn();
  });
};

function updateInsert(account, fn){
  accounts.insert(account, function(err, record){
    fn(record);
  });
}

Account.prototype.addMember = function(memberId, fn){
  var self = this;
  var _id = Mongo.ObjectID(memberId);
  users.findOne({_id:_id}, function(err, user){
    if(user){
      self.members.push(memberId);
      updateInsert(self, function(record){
        if(record){
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



