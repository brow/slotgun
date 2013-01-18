var Browser = require('zombie');

module.exports = Agent;

function contains(string, substring){
  return string.indexOf(substring) !== -1;
}

function last(array){
  return array.length > 0 ? array[array.length-1] : null;
}

function Agent(){
  this._browser = new Browser({
    runScripts: false,
    loadCSS: false
  });
}

Agent.prototype.go = function(event, callback){
  var browser = this._browser;
  this._browser.visit(event.url, function(err){
    if (err) {
      callback(err);
    }
    else if (!contains(browser.text(), event.host)) {
      callback(new Error("page doesn't contain the event host's name"));
    }
    else if (!contains(browser.text(), last(event.date.split('/')))) {
      callback(new Error("page doesn't contain the event date"));
    }
    else {
      callback();
    }
  });
}
