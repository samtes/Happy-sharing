'use strict';

var d = require('../lib/request-debug');
var initialized = false;

module.exports = function(req, res, next){
  if(!initialized){
    initialized = true;
    load(req.app, next);
  }else{
    next();
  }
};

function load(app, fn){
  var home = require('../routes/home');
  var users = require('../routes/users');
  var accounts = require('../routes/accounts');

  app.get('/', d, home.index);
  app.get('/register', d, users.fresh);
  app.get('/accounts', d, accounts.index);
  app.get('/accounts/new', d, accounts.fresh);
  app.get('/accounts/:id', d, accounts.show);
  app.post('/accounts', d, accounts.create);
  app.post('/register', d, users.create);
  app.get('/login', d, users.login);
  app.post('/login', d, users.authenticate);
  app.get('/users/:id', d, users.show);
  app.get('/logout', d, users.logout);
  console.log('Routes Loaded');
  fn();
}

