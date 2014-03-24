'use strict';

var request = require('request');
var fs = require('fs');
var jade = require('jade');

exports.sendWelcome = function(data, fn){
  send({from:'admin@happyshare.us', to:data.to, name:data.name, subject:'Welcome to Happy Share', template:'welcome'}, fn);
};

exports.inviteMember = function(data, fn){
  send({from:'admin@happyshare.us', to:data.to, message:data.message, subject:'You have been invited to Haapy-share', template:'invited'}, fn);
};

exports.addedToAccount = function(data, fn){
  send({from:'admin@happyshare.us', to:data.to, name:data.name, account:data.account, subject:'Added to Happy-Share account', template:'account-added'}, fn);
};

exports.removedAccount = function(data, fn){
  send({from:'admin@samtes.us', to:data.to, name:data.name, account:data.account, subject:'Added to Happy-Share account', template:'account-removed'}, fn);
};

function send(data, fn){
  if(data.to.match(/@nomail.com/g)){fn(); return;}

  var key = process.env.MAILGUN;
  var url = 'https://api:' + key + '@api.mailgun.net/v2/samtes.us/messages';
  var post = request.post(url, function(err, response, body){
    fn(err, body);
  });

  var form = post.form();
  form.append('from', data.from);
  form.append('to', data.to);
  form.append('subject', data.subject);
  form.append('html', compileJade(data));
}

function compileJade(data){
  var template = __dirname + '/../views/email/' + data.template + '.jade';
  var original = fs.readFileSync(template, 'utf8');
  var partial = jade.compile(original);
  var output = partial(data);

  return output;
}
