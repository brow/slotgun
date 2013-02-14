var Server = require('../lib/server');
var Client = require('../lib/client');
var logger = require('../lib/logger');
var querystring = require('querystring');
var assert = require('assert');
var sinon = require('sinon')
var nock = require('nock');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');

describe('Server', function(){

  describe('new', function() {

    it.skip('throws an exception if goal is malformed', function(){
      assert.throws(
        function(){
          new Server([{
            host: 'Tom Knight',
            date: '1/17',
            time: '2:55',
            email: 'tom@example.com',
            topic: 'TBD'
          }]);
        },
        Error
      );
    });

  });

  describe('.listen', function(){

    var port = 8825,
        client = new Client('localhost', port);

    beforeEach(function(){
      sinon.stub(logger, 'log');
    });

    afterEach(function(){
      logger.log.restore();
      nock.cleanAll();
    });

    function readTestFileSync(filename) {
      return fs.readFileSync(path.join('test/files', filename), 'utf8');
    }

    function receiveEmail(email,callback) {
      client.send(
        'slotgun@example.com',
        'officehours@example.com',
        email,
        function(err){
          assert.ifError(err);
          callback();
        }
      );
    }

    function withMockSlottd(opts, fn) {
      var nocks = [];

      _.each(opts.events, function(event) {
        nocks.push(nock('http://slottd.com')
          .get(path.join('/events', event.eventId, 'slots'))
          .reply(200, readTestFileSync(event.slotsHtmlFile)));

        _.each(event.slots, function(slot) {
          nocks.push(nock('http://slottd.com')
            .matchHeader('x-csrf-token', event.csrfToken)
            .matchHeader('x-requested-with', 'XMLHttpRequest')
            .post(path.join('/events', event.eventId,
                            'slots', slot.slotId,
                            'reservation'),
                  querystring.stringify({user_token:event.userToken}))
            .reply(201, {slot_id:slot.slotId})
            .post(path.join('/events', event.eventId,
                            'slots', slot.slotId,
                            'reservation_confirmation'),
                  querystring.stringify({
                    'confirmation[name]': slot.confirmation.guest,
                    'confirmation[email]': slot.confirmation.email,
                    'confirmation[discussion_topic]': slot.confirmation.topic
                  }))
            .reply(201));
        });
      });

      fn(nocks);
    }

    function withServer(goals, callback, fn) {
      var server = new Server(goals),
          after = function(){ server.end(callback); };

      server.listen(port);
      fn(after);
    }

    function assertLoggedReservationFor(goal) {
      assert(logger.log.calledWithMatch('Reserving ' + goal.host + ' for ' + goal.guest));
    }

    function assertReservesGoalsOnEmail(goals, email, mock_opts, callback) {
      withServer(goals, callback, function(callback) {
        withMockSlottd(mock_opts, function(mocks){
          receiveEmail(email, function(){
            _.each(goals, function(goal) {
              assertLoggedReservationFor(goal);
            });
            _.each(mocks, function(mock) {
              mock.done();
            });
            callback();
          });
        });
      });
    }

    it('reserves a goal after receiving an email', function(done){
      var goal = {
            host: 'Tom Knight',
            date: '1/17',
            time: '2:55',
            guest: 'Tom Brow',
            email: 'tom@example.com',
            topic: 'TBD'
          },
          email = readTestFileSync('real_email.eml'),
          mock_opts = {
            events: [{
              eventId: 'zcvje2pmyv',
              csrfToken: 'V9xosljRgRw5cYIe2NAw7cdG4/yzQjyXtTQ8ZnwiUD8=',
              userToken: 'nzvmpfpq87',
              slotsHtmlFile: 'slots.html',
              slots: [{
                slotId: '4822',
                confirmation: goal
              }]
            }]
          };

      assertReservesGoalsOnEmail([goal], email, mock_opts, done);
    });

    it('reserves a different goal after receiving a different email', function(done){
      var goal = {
            host: 'Alex Tavakoli',
            date: '2/7',
            time: '1:15',
            guest: 'Tom Brow',
            email: 'tom@fiftyfourth.st',
            topic: 'TBD'
          },
          email = readTestFileSync('real_email.2.eml'),
          mock_opts = {
            events: [{
              eventId: 'joom2qgnv7',
              csrfToken: 'k32obZIEmLi1nt+aXvUJtB4JLdQBlf9gnOo6dvqaJHk=',
              userToken: 'dfd8zxoaqr',
              slotsHtmlFile: 'slots.2.html',
              slots: [{
                slotId: '5542',
                confirmation: goal
              }]
            }]
          };

      assertReservesGoalsOnEmail([goal], email, mock_opts, done);
    });

  });

})
