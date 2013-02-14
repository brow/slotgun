var Server = require('../lib/server');

var server = new Server([
  { host: 'Alex Tavakoli',
    date: '2/7',
    time: '1:15',
    guest: 'Tom Brow',
    email: 'tom@fiftyfourth.st',
    topic: 'TBD' },
]);

server.listen(25);
