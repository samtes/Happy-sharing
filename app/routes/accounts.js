'use strict';


var Account = require('../models/account');
var User = require('../models/user');
var Record = require('../models/record');
var accounting = require('accounting');
var moment = require('moment');

exports.index = function(req, res){
  Account.findByMemberId(req.session.userId.toString(), function(accounts){
    User.findAll(function(users){
      res.render('accounts/index', {title:'Your Accounts', users:users, accounts:accounts});
    });
  });
};

exports.fresh = function(req, res){
  res.render('accounts/new', {title: 'Create an Account'});
};

exports.create = function(req, res){
  req.body.ownerId = req.session.userId;
  var userObj = req.session.userId;
  req.body.balance = {userId:userObj, curBal: 0};
  req.body.logic = {userId:userObj, share: 0};
  var account = new Account(req.body);
  User.findById(req.session.userId, function(user){
    account.insert(function(){
      user.accounts.push(account._id.toString());
      user.update(function(){
        res.redirect('accounts/members/'+ account._id.toString());
      });
    });
  });
};

exports.show = function(req, res){
  Account.findById(req.params.id, function(account){
    User.findAll(function(users){
      User.findByAccountId(req.params.id, function(members){
        User.findById(req.session.userId, function(admin){
          res.render('accounts/show', {title:'Payment Made', accounting:accounting, admin:admin, members:members, users:users, account:account});
        });
      });
    });
  });
};

exports.invite = function(req, res){
  Account.sendInviteEmail(req.body, function(){
    res.redirect('/accounts/'+req.params.id);
  });
};

exports.member = function(req, res){
  Account.findById(req.params.id, function(account){
    account.addMember(req.body.member, function(){
      res.redirect('/accounts/members/'+req.params.id);
    });
  });
};

exports.showMember = function(req, res){
  Account.findById(req.params.id, function(account){
    account.checkShares(function(shares){
      User.findByAccountId(req.params.id, function(users){
        User.findAll(function(allUsers){
          account.notMembers(allUsers, function(notMembers){
            Record.findByAccountId(req.params.id, function(records){
              res.render('accounts/members', {title:'Payment History', notMembers:notMembers, shares:shares, accounting:accounting, allUsers:allUsers, moment:moment, users:users, records:records, account:account});
            });
          });
        });
      });
    });
  });
};

exports.setLogic = function(req, res){
  Account.findById(req.params.id, function(account){
    account.logic(req.body, function(){
      account.update(function(){
        res.redirect('/accounts/members/'+account._id.toString());
      });
    });
  });
};

exports.remove = function(req, res){
  Account.findById(req.params.accountId, function(account){
    account.removeMember(req.params.memberId, function(state){
      if (state){
        account.update(function(){
          Account.findById(req.params.accountId, function(updatedAccount){
            User.findById(req.params.memberId, function(user){
              user.removeAccount(req.params.accountId, function(){
                user.update(function(){
                  res.send({account:updatedAccount, state:true});
                });
              });
            });
          });
        });
      } else {
        res.send({account:account, state:false});
      }
    });
  });
};
