'use strict';


module.exports = User;

var bcrypt = require('bcrypt');
var path = require('path');
var fs = require('fs');
var users = global.nss.db.collection('users');
var Mongo = require('mongodb');
var email = require('../lib/email');



function User(user){
  this.name = user.name;
  this.email = user.email;
  this.password = user.password;
  this.pic = user.pic ? user.pic : null;
  this.role = user.role;
}


User.prototype.register = function(fn){
  var self = this;

  hashPassword(self.password, function(hashedPwd){
    self.password = hashedPwd;
    if(self.pic){
      addPic(self.pic, function(path){
        self.pic = path;
      });
    }
    insert(self, function(err){
      if(self._id){
        email.sendWelcome({to:self.email}, function(err, body){
          fn(err, body);
        });
      }else{
        fn();
      }
    });
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


User.findById = function(id, fn){
  var _id = Mongo.ObjectID(id);
  users.findOne({_id:_id}, function(err, record){
    fn(record);
  });
};
