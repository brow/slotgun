var Server = require('./lib/server');

var server = new Server([
  { host: 'Tom Knight',
    date: '1/17',
    time: '2:55',
    guest: 'Tom Brow',
    email: 'tom@example.com',
    topic: 'TBD' },
]);

server.listen(25);
