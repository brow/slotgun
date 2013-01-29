var simplesmtp = require('simplesmtp');

module.exports = Server;

function Server(goals){

  this._goals = goals;
  this._server = simplesmtp.createSimpleServer({}, function(req){
    req.accept();
  })

}

Server.prototype.listen = function(port){
  this._server.listen(port);
}

Server.prototype.end = function(callback){
  this._server.server.end(callback);
}
