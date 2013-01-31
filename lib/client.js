var simplesmtp = require('simplesmtp');

module.exports = Client;

function Client(host, port){
  this._host = host;
  this._port = port;
}

Client.prototype.send = function(to,
                                 from,
                                 email,
                                 callback){
  var connection = simplesmtp.connect(this._port, this._host);

  connection.once('idle', function(){
    connection.useEnvelope({
      from: from,
      to: [to]
    });
  });

  connection.on('message', function(){
    connection.end(email);
  });

  connection.on('ready', function(success){
    connection.quit();
    if(success){
      callback(null);
    } else {
      callback(new Error('message was not transmitted'));
    }
  });
}
