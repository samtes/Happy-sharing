'use strict';


module.exports = User;

var bcrypt = require('bcrypt');
var path = require('path');
var fs = require('fs');
var users = global.nss.db.collection('users');
var Mongo = require('mongodb');
var email = require('../lib/email');
var _ = require('lodash');


function User(user){
  this.name = user.name;
  this.email = user.email;
  this.password = user.password;
  this.role = 'member';
  this.accounts = [];
}


User.prototype.register = function(oldpath, fn){
  var self = this;

  hashPassword(self.password, function(hashedPwd){
    self.password = hashedPwd;
    if(path.extname(oldpath)){
      addPic(oldpath, function(newpath){
        self.pic = newpath;
      });
    }
    insert(self, function(err){
      if(self._id){
        email.sendWelcome({to:self.email, name:self.name}, function(err, body){
          fn(err, body);
        });
      }else{
        fn();
      }
    });
  });
};

User.findByAccountId = function(id, fn){
  users.find({accounts:id}).toArray(function(err, records){
    fn(records);
  });
};

User.findById = function(id, fn){
  var _id = Mongo.ObjectID(id);
  users.findOne({_id:_id}, function(err, user){
    if(user){
      fn(_.extend(user, User.prototype));
    } else {
      fn();
    }
  });
};

User.findAll = function(fn){
  users.find().toArray(function(err, records){
    fn(records);
  });
};

User.prototype.update = function(fn){
  users.update({_id:this._id}, this, function(err, count){
    fn(err);
  });
};

User.findByEmailandPassword = function(email, password, fn){
  users.findOne({email:email}, function(err, user){
    if(user){
      bcrypt.compare(password, user.password, function(err, result){
        if(result){
          fn(user);
        } else {
          fn();
        }
      });
    } else {
      fn();
    }
  });
};

function addPic(oldpath, fn){
  var filename = path.basename(oldpath);
  var abspath = __dirname + '/../static';
  var relpath = '/img/users/' + filename;

  fs.renameSync(oldpath, abspath+relpath);

  fn(relpath);
}

function hashPassword(password, fn){
  bcrypt.hash(password, 8, function(err, hash){
    fn(hash);
  });
}

function insert(user, fn){
  users.findOne({email:user.email}, function(err, userFound){
    if(!userFound){
      users.insert(user, function(err, record){
        fn(err);
      });
    }else{
      fn();
    }
  });
}
