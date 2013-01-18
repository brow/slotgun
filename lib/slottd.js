var http = require('http');

function contains(string, substring){
  return string.indexOf(substring) !== -1;
}

function last(array){
  return array.length > 0 ? array[array.length-1] : null;
}

exports.getSlots = function(event, callback){
  http.get(event.url, function(response) {
    callback(null);
  }).on('error', function(error) {
    callback(error);
  });
}
