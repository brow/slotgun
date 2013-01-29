var Server = require('../lib/server');
var Client = require('../lib/client');
var fs = require('fs');
var assert = require('assert');

describe('Server', function(){

  it('reserves a slot that matches a goal', function(done){
    var port = 8825,
        goals = [{
          host: 'Sonal Mane',
          date: '2/7',
          time: '1:00',
          guest: 'Tom Brow',
          email: 'tom@fiftyfourth.st',
          topic: 'TBD' }],
        email = fs.readFileSync('test/files/real_email.eml', 'utf8'),
        client = new Client('localhost', port),
        server = new Server(goals);

    server.listen(port);
    client.send(
      'slotgun@example.com',
      'officehours@example.com',
      email,
      function(err){
        assert.ifError(err);
        server.end(done);
      }
    );
  });

})
