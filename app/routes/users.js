'use strict';

var User = require('../models/user');


exports.index = function(req, res){
  res.render('home/index', {title: 'Express Template'});
};

exports.fresh = function(req, res){
  res.render('users/fresh', {title: 'Registration page'});
};

exports.create = function(req, res){
  var user = new User(req.body);
  user.register(req.files.pic.path, function(){
    if(user._id){
      User.findByEmailandPassword(req.body.email, req.body.password, function(foundUser){
        if(foundUser){
          req.session.regenerate(function(){
            req.session.userId = user._id;
            req.session.save(function(){
              res.redirect('users/'+foundUser._id.toString());
            });
          });
        } else {
          res.render('users/fresh', {title: 'Registration page'});
        }
      });
    } else {
      res.render('users/fresh', {title: 'Registration page'});
    }
  });
};

exports.login = function(req, res){
  res.render('users/login', {title: 'Login page'});
};

exports.authenticate = function(req, res){
  User.findByEmailandPassword(req.body.email, req.body.password, function(user){
    if(user){
      req.session.regenerate(function(){
        req.session.userId = user._id;
        req.session.save(function(){
          res.redirect('users/'+user._id.toString());
        });
      });
    } else {
      res.render('users/login', {title: 'Login page'});
    }
  });
};

exports.show = function(req, res){
  User.findById(req.params.id, function(user){
    console.log(user);
    res.render('users/show', {user:user});
  });
};

exports.logout = function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
};
