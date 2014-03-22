'use strict';

var Account = require('../models/account');
//var User = require('../models/user');


exports.index = function(req, res){
  Account.findByUserId(req.session.userId, function(accounts){
    res.render('accounts/index', {title: 'Accounts Index', accounts:accounts});
  });
};

exports.fresh = function(req, res){
  res.render('accounts/new', {title: 'Create an Account'});
};

exports.create = function(req, res){
  req.body.userId = req.session.userId;
  var account = new Account(req.body);
  account.insert(function(){
    res.redirect('accounts/'+account._id.toString());
  });
};

exports.show = function(req, res){
  Account.findById(req.params.id, function(account){
    res.render('accounts/show', {account:account});
  });
};
