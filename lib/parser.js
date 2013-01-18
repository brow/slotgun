var _ = require('underscore');

module.exports.parseEventLine = parseEventLine = function(line){
  var match, regex = /^(\d\d?\/\d\d?) .* (https?\:\/\/slottd.com.*) \[.*\]$/;
  if (match = regex.exec(line)) {
    return {
      date: match[1],
      url: match[2]
    };
  } 
  else {
    return null;
  }
}

module.exports.parseHostLine = parseHostLine = function(line){
  var match, regex = /^([\w\s]*) \[.*\],$/;
  if (match = regex.exec(line)) {
    return match[1];
  } 
  else {
    return null;
  }
}

module.exports.parse = function(string){
  var lines = string.split('\n')
  ,   events = []
  ,   curHost = null;

  _.each(lines, function(line){
    var host, event;
    if (host = parseHostLine(line)) {
      curHost = host;
    }
    else if (curHost && (event = parseEventLine(line))) {
      event.host = curHost;
      events.push(event);
    }
  });
  
  return events;
}
