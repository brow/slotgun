var simplesmtp = require('simplesmtp');
var slottd = require('../lib/slottd');
var parser = require('../lib/parser');
var async = require('async');
var _ = require('underscore');

module.exports = Server;

function Server(goals){

  var self = this;

  this._goals = goals;
  this._server = simplesmtp.createSimpleServer({}, function(req){
    var email = '';

    req.on('data', function(data){
      email += data;
    });

    req.on('end', function(){
      self._handleEmail(email, function(){
        req.accept();
      });
    });
  })

  _.bindAll(self);

}

Server.prototype.listen = function(port){
  this._server.listen(port);
}

Server.prototype.end = function(callback){
  this._server.server.end(callback);
}

Server.prototype._handleEmail = function(email, callback){
  var self = this;
  parser.parseEmail(email, function(err, events){
    async.forEach(events, self._handleEvent, callback);
  });
}

Server.prototype._handleEvent = function(event, callback){
  var self = this;
  var matchesGoal = _.findWhere(self._goals, {
    host: event.host,
    date: event.date
  });

  if (matchesGoal) {
    slottd.getSlots(event, function(err, slots, userToken){
      async.forEach(slots, function(slot, callback){
        var goal = _.findWhere(self._goals, {time: slot.time});
        if (goal) {
          self._reserveSlot(slot, 
                            userToken,
                            goal.name, 
                            goal.email, 
                            goal.topic, 
                            callback);
        } else {
          callback(null);
        }
      }, callback);
    });
  } else {
    callback(null);
  }
}

Server.prototype._reserveSlot = function(slot, userToken, name, email, topic, callback) {
  slottd.createReservation(slot.reservationPath, userToken, function(err, slotId){
    if (err) {
      console.log(err);
      callback(null);
    } else {
      slottd.confirmReservation(slot.confirmationPath, name, email, topic, function(err){
        if (err){ console.log(err); }
        callback(null);
      });
    }
  });
}
