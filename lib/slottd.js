var http = require('http');
var jsdom = require('jsdom');
var _ = require('underscore');

function contains(string, substring){
  return string.indexOf(substring) !== -1;
}

function last(array){
  return array.length > 0 ? array[array.length-1] : null;
}

exports.getReservationUrls = function(event, callback){
  http.get(event.url, function(request){
    var body = '';

    request.on('data', function(chunk) {
      body += chunk;
    });

    request.on('end', function(){
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
          var reservationUrls = _.map(
            window.document.querySelectorAll('button[data-href-create]'),
            function(elem){
              return elem.getAttribute('data-href-create');
            });
          callback(null, reservationUrls, userToken);
        }
      });
    })
  }).on('error', function(error) {
    callback(error);
  });
    
}
