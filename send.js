var Client = require('./lib/client');
var fs = require('fs');

var port = 25,
    client = new Client('localhost', port),
    email = fs.readFileSync(process.argv[2], 'utf8');

console.log(email);

client.send(
  'slotgun@example.com',
  'officehours@example.com',
  email,
  function(err){
  }
);

