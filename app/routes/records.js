'use strict';


var Record = require('../models/record');
var Account = require('../models/account');
var User = require('../models/user');


exports.show = function(req, res){
  Record.findById(req.params.id, function(record){
    Account.findById(record.accountId.toString(), function(account){
      User.findById(record.userId.toString(), function(user){
        res.render('records/show', {title: 'Record Details', user:user, account:account, record:record});
      });
    });
  });
};

exports.create = function(req, res){
  req.body.userId = req.session.userId;
  req.body.accountId = req.params.id;
  var record = new Record(req.body);
  Account.findById(req.params.id, function(account){
    User.findByAccountId(account._id.toString(), function(members){
      User.findById(req.session.userId, function(user){
        var data = {paidBy:user.name, amount:req.body.amount, day:new Date(req.body.date), members:members, account:account.name};
        var balanceData = {userId:req.body.userId, amount:req.body.amount};
        record.insert(req.files.attachment.path, data, function(count){
          if(count){
            account.updateBalance(balanceData, function(){
              res.redirect('/accounts/members/'+req.params.id);
            });
          } else {
            res.redirect('/accounts/'+req.params.id);
          }
        });
      });
    });
  });
};
