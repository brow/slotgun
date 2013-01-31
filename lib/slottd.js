var querystring = require('querystring');
var http = require('http');
var jsdom = require('jsdom');
var _ = require('underscore');

function contains(string, substring){
  return string.indexOf(substring) !== -1;
}

function postHeaders(csrfToken){
  return {
    'x-csrf-token': csrfToken,
    'x-requested-with': 'XMLHttpRequest'
  };
}

exports.getSlots = function(event, callback){
  http.get(event.url, function(response){
    var body = '';

    response.on('data', function(chunk) {
      body += chunk;
    });

    response.on('end', function(){
      jsdom.env(body, function(errors, window){
        if (!window) {
          callback(new Error('slots page dom could not be built'));
        }
        else if(!contains(window.document.body.textContent, event.host)) {
          callback(new Error('slots page does not contain host name'));
        }
        else {
          var userToken = window.document
            .querySelector('ul[data-user-token]')
            .getAttribute('data-user-token');
          var csrfToken = window.document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute('content');
          var slots = _.map(
            window.document.querySelectorAll('.slot'),
            function(slotElem){
              return {
                time: slotElem
                  .querySelector('.slot_time .time')
                  .textContent,
                reservationPath: slotElem
                  .querySelector('.reservation_button button[data-href-create]')
                  .getAttribute('data-href-create'),
                confirmationPath: slotElem
                  .querySelector('.confirm_reservation_form form')
                  .getAttribute('action'),
              };
            });
          callback(null, slots, userToken, csrfToken);
        }
      });
    })
  }).on('error', function(error){
    callback(error);
  });
    
}

exports.createReservation = function(path, userToken, csrfToken, callback){
  var request = http.request({
    method: 'POST',
    hostname: 'slottd.com',
    path: path,
    headers: postHeaders(csrfToken)
  }, function(response){
    var body = '';

    response.on('data', function(chunk) {
      body += chunk;
    });

    response.on('end', function(){
      var parse, slotId;
      if (response.statusCode != 201) {
        callback(new Error('response had status ' + response.statusCode));
      }
      else if (!(parse = JSON.parse(body))) {
        callback(new Error('response could not be parsed as JSON'));
      }
      else if (!(slotId = parse['slot_id'])) {
        callback(new Error('response does not contain a slot_id'));
      }
      else {
        callback(null, slotId);
      }
    })
  }).on('error', function(error){
    callback(error);
  });

  request.end(querystring.stringify({
    user_token: userToken
  }));
}

exports.confirmReservation = function(confirmationUrl, name, email, topic, csrfToken, callback){
  var request = http.request({
    method: 'POST',
    hostname: 'slottd.com',
    path: confirmationUrl,
    headers: postHeaders(csrfToken)
  }, function(response){
    response.on('end', function(){
      if (response.statusCode != 201) {
        callback(new Error('response had status ' + response.statusCode));
      }
      else {
        callback(null);
      }
    })
  }).on('error', function(error){
    callback(error);
  });

  request.end(querystring.stringify({
    'confirmation[name]': name,
    'confirmation[email]': email,
    'confirmation[discussion_topic]': topic
  }));
}
