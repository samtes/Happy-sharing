'use strict';

var Account = require('../models/account');
var User = require('../models/user');
//var _ = require('lodash');

exports.index = function(req, res){
  Account.findByUserId(req.session.userId.toString(), function(accounts){
    res.render('accounts/index', {title:'This is the index page', accounts:accounts});
  });
};

exports.fresh = function(req, res){
  res.render('accounts/new', {title: 'Create an Account'});
};

exports.create = function(req, res){
  req.body.ownerId = req.session.userId;
  var account = new Account(req.body);
  User.findById(req.session.userId, function(user){
    account.insert(function(){
      user.accounts.push(account._id.toString());
      user.update(function(){
        res.redirect('accounts/'+ account._id.toString());
      });
    });
  });
};

exports.show = function(req, res){
  Account.findById(req.params.id, function(account){
    User.findAll(function(users){
      User.findByAccountId(req.params.id, function(members){
        User.findById(req.session.userId, function(admin){
          res.render('accounts/show', {title:'Payment Made', admin:admin, members:members, users:users, account:account});
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
      res.redirect('/accounts/'+req.params.id);
    });
  });
};

exports.showMember = function(req, res){
  Account.findById(req.params.id, function(account){
    User.findByAccountId(req.params.id, function(users){
      res.render('accounts/members', {title:'Payment History', users:users, account:account});
    });
  });
};

exports.setLogic = function(req, res){
  Account.findById(req.params.id, function(account){
    account.logic(req.body, function(){
      res.redirect('/accounts/members/'+account._id.toString());
    });
  });
};

exports.paid = function(req, res){
  req.body.paidBy = req.session.userId;
  req.body.date = new Date(req.body.date);
  Account.findById(req.params.id, function(account){
    User.findByAccountId(account._id.toString(), function(users){
      User.findById(req.session.userId, function(user){
        account.payment(req.body, user, account, users, function(){
          res.redirect('/accounts/members/'+req.params.id);
        });
      });
    });
  });
};
