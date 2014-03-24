'use strict';

var Account = require('../models/account');
var User = require('../models/user');


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
  account.insert(function(){
    res.redirect('accounts/'+ account._id.toString());
  });
};

exports.show = function(req, res){
  Account.findById(req.params.id, function(account){
    User.findAll(function(users){
      res.render('accounts/show', {title:'Add image', users:users, account:account});
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
