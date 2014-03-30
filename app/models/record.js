'use strict';


module.exports = Record;

var path = require('path');
var fs = require('fs');
var records = global.nss.db.collection('records');
var Mongo = require('mongodb');
var email = require('../lib/email');
var _ = require('lodash');
var accounting = require('accounting');


function Record(record){
  this.accountId = Mongo.ObjectID(record.accountId);
  this.date = new Date(record.date);
  this.userId = Mongo.ObjectID(record.userId);
  this.amount = accounting.formatMoney(record.amount * 1);
  this.note = record.note;
}

Record.prototype.insert = function(picPath, data, fn){
  console.log(data);
  var self = this;
  if(path.extname(picPath)){
    addAttachment(picPath, function(newPath){
      self.attachment = newPath;
      records.insert(self, function(err, count){
        processPaymentEmails(data, function(){
          fn(count);
        });
      });
    });
  } else {
    records.insert(self, function(err, count){
      processPaymentEmails(data, function(){
        fn(count);
      });
    });
  }
};

Record.findById = function(id, fn){
  var _id = Mongo.ObjectID(id);
  records.findOne({_id:_id}, function(err, record){
    fn(_.extend(record, Record.prototype));
  });
};

Record.findByAccountId = function(id, fn){
  var accountId = Mongo.ObjectID(id);
  records.find({accountId:accountId}).toArray(function(err, records){
    fn(records);
  });
};

Record.findByUserId = function(id, fn){
  var userId = Mongo.ObjectID(id);
  records.find({userId:userId}).toArray(function(err, records){
    fn(records);
  });
};

function processPaymentEmails(data, fn){
  _.map(data.members, function(user){
    return sendEmail(user.email, user.name, data, function(){
    });
  });
  fn();
}

function sendEmail(toEmail, name, data, fn){
  email.paymentMade({to:toEmail, name:name, amount:accounting.formatMoney(data.amount), day:data.day, paidBy:data.paidBy}, function(err, body){
    fn(err, body);
  });
}

function addAttachment(oldpath, fn){
  var filename = path.basename(oldpath);
  var abspath = __dirname + '/../static';
  var relpath = '/img/records/' + filename;

  fs.renameSync(oldpath, abspath+relpath);
  fn(relpath);
}
