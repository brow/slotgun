var Server = require('../lib/server');
var Client = require('../lib/client');
var logger = require('../lib/logger');
var querystring = require('querystring');
var assert = require('assert');
var sinon = require('sinon')
var nock = require('nock');
var fs = require('fs');

describe('Server', function(){

  var goals = [
        {
          host: 'Tom Knight',
          date: '1/17',
          time: '2:55',
          guest: 'Tom Brow',
          email: 'tom@example.com',
          topic: 'TBD'
        },
        {
          host: 'Alex Tavakoli',
          date: '2/7',
          time: '1:15',
          guest: 'Tom Brow',
          email: 'tom@fiftyfourth.st',
          topic: 'TBD'
        }
      ],
      port = 8825,
      client = new Client('localhost', port),
      server = new Server(goals);

  beforeEach(function(){
    sinon.stub(logger, 'log');
  });

  afterEach(function(){
    logger.log.restore();
    nock.cleanAll();
  });

  after(function(done){
    server.end(done);
  });

  it('reserves a slot that matches a goal', function(done){
    var email = fs.readFileSync('test/files/real_email.eml', 'utf8');

    var csrfToken = 'V9xosljRgRw5cYIe2NAw7cdG4/yzQjyXtTQ8ZnwiUD8=',
        mockGet = nock('http://slottd.com')
          .get('/events/zcvje2pmyv/slots')
          .reply(200, fs.readFileSync('test/files/slots.html', 'utf8')),
        mockPost = nock('http://slottd.com')
          .matchHeader('x-csrf-token', csrfToken)
          .matchHeader('x-requested-with', 'XMLHttpRequest')
          .post('/events/zcvje2pmyv/slots/4822/reservation',
                'user_token=nzvmpfpq87')
          .reply(201, {slot_id:4822})
          .post('/events/zcvje2pmyv/slots/4822/reservation_confirmation',
                querystring.stringify({
                  'confirmation[name]': goals[0].guest,
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
        assert(logger.log.calledWithMatch('officehours@example.com'), 'logs sender');
        assert(logger.log.calledWithMatch(goals[0].host), 'logs reserved host');
        assert(logger.log.calledWithMatch(goals[0].guest), 'logs reserving guest');

        mockGet.done();
        mockPost.done();
        done();
      }
    );
  });

  it('reserves a different slot that matches a different goal', function(done){
    var email = fs.readFileSync('test/files/real_email.2.eml', 'utf8');

    var csrfToken = 'k32obZIEmLi1nt+aXvUJtB4JLdQBlf9gnOo6dvqaJHk=',
        mockGet = nock('http://slottd.com')
          .get('/events/joom2qgnv7/slots')
          .reply(200, fs.readFileSync('test/files/slots.2.html', 'utf8')),
        mockPost = nock('http://slottd.com')
          .matchHeader('x-csrf-token', csrfToken)
          .matchHeader('x-requested-with', 'XMLHttpRequest')
          .post('/events/joom2qgnv7/slots/5542/reservation',
                'user_token=dfd8zxoaqr')
          .reply(201, {slot_id:4822})
          .post('/events/joom2qgnv7/slots/5542/reservation_confirmation',
                querystring.stringify({
                  'confirmation[name]': goals[1].guest,
                  'confirmation[email]': goals[1].email,
                  'confirmation[discussion_topic]': goals[1].topic
                }))
          .reply(201);

    server.listen(port);
    client.send(
      'slotgun@example.com',
      'officehours@example.com',
      email,
      function(err){
        assert.ifError(err);
        assert(logger.log.calledWithMatch('officehours@example.com'), 'logs sender');
        assert(logger.log.calledWithMatch(goals[1].host), 'logs reserved host');
        assert(logger.log.calledWithMatch(goals[1].guest), 'logs reserving guest');

        mockGet.done();
        mockPost.done();
        done();
      }
    );
  });

})
