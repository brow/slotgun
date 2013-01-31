var Server = require('../lib/server');
var Client = require('../lib/client');
var querystring = require('querystring');
var assert = require('assert');
var nock = require('nock');
var fs = require('fs');

describe('Server', function(){

  after(function(){
    nock.cleanAll();
  });

  it('reserves a slot that matches a goal', function(done){
    var port = 8825,
        goals = [{
          host: 'Tom Knight',
          date: '1/17',
          time: '2:55',
          guest: 'Tom Brow',
          email: 'tom@example.com',
          topic: 'TBD' }],
        email = fs.readFileSync('test/files/real_email.eml', 'utf8'),
        client = new Client('localhost', port),
        server = new Server(goals);

    var csrfToken = 'V9xosljRgRw5cYIe2NAw7cdG4/yzQjyXtTQ8ZnwiUD8=';
    var mock_get = nock('http://slottd.com')
      .get('/events/zcvje2pmyv/slots')
      .reply(200, fs.readFileSync('test/files/slots.html', 'utf8'));
    var mock_post = nock('http://slottd.com')
      .matchHeader('x-csrf-token', csrfToken)
      .matchHeader('x-requested-with', 'XMLHttpRequest')
      .post('/events/zcvje2pmyv/slots/4822/reservation', 
            'user_token=nzvmpfpq87')
      .reply(201, {slot_id:4822})
      .post('/events/zcvje2pmyv/slots/4822/reservation_confirmation', 
            querystring.stringify({
              'confirmation[name]': goals[0].name,
              'confirmation[email]': goals[0].email,
              'confirmation[discussion_topic]': goals[0].topic
            }))
      .reply(201);

    server.listen(port);
    client.send(
      'slotgun@example.com',
      'officehours@example.com',
      email,
      function(err){
        assert.ifError(err);

        mock_post.done();
        server.end(done);
      }
    );
  });

})
