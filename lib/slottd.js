var http = require('http');
var jsdom = require('jsdom');
var fs = require('fs');

function contains(string, substring){
  return string.indexOf(substring) !== -1;
}

function last(array){
  return array.length > 0 ? array[array.length-1] : null;
}

function jQuerySource(){
  return fs.readFileSync('vendor/jquery.js', 'utf8');
}

exports.getSlots = function(event, callback){
  http.get(event.url, function(request){
    var body = '';

    request.on('data', function(chunk) {
      body += chunk;
    });

    request.on('end', function(){
      jsdom.env({
        html: body, 
        src: [jQuerySource()],
        done: function(errors, window){
          var text = window.$('body').text();
          if (!window) {
            callback(new Error('slots page dom could not be built'));
          }
          else if(!contains(text, event.host)) {
            callback(new Error('slots page does not contain host name'));
          }
          else {
            callback(null, []);
          }
        }
      });
    })
  }).on('error', function(error) {
    callback(error);
  });
    
}
