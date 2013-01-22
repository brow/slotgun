var http = require('http');
var jsdom = require('jsdom');
var _ = require('underscore');

function contains(string, substring){
  return string.indexOf(substring) !== -1;
}

function last(array){
  return array.length > 0 ? array[array.length-1] : null;
}

exports.getReservationPaths = function(event, callback){
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
            .querySelectorAll('ul[data-user-token]').item(0)
            .getAttribute('data-user-token');
          var reservationPaths = _.map(
            window.document.querySelectorAll('button[data-href-create]'),
            function(elem){
              return elem.getAttribute('data-href-create');
            });
          callback(null, reservationPaths, userToken);
        }
      });
    })
  }).on('error', function(error){
    callback(error);
  });
    
}

exports.createReservation = function(path, userToken, callback){
  var request = http.request({
    method:'POST',
    hostname:'slottd.com',
    path:path
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

  request.write('user_token=' + userToken);
  request.end();
}
