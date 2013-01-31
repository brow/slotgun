var querystring = require('querystring');
var slottd = require('../lib/slottd');
var assert = require('assert');
var nock = require('nock');
var fs = require('fs');
var _ = require('underscore');

describe('slottd', function(){

  describe('.getSlots', function(){

    var event = {
      host: 'Tom Knight',
      date: '1/17',
      url: 'http://slottd.com/events/zcvje2pmyv/slots'
    };
before(function(){
      nock('http://slottd.com')
        .persist()
        .get('/events/zcvje2pmyv/slots')
        .reply(200, fs.readFileSync('test/files/slots.html', 'utf8'));
    });

    after(function(){
      nock.cleanAll();
    });

    it('returns slots, user token, and CSRF token', function(done){
      slottd.getSlots(event, function(err, slots, userToken, csrfToken){
        assert.ifError(err);
        assert.deepEqual(slots, [
          { time: '2:00',
            reservationPath: '/events/zcvje2pmyv/slots/4821/reservation',
            confirmationPath: '/events/zcvje2pmyv/slots/4821/reservation_confirmation'},
          { time: '2:55',
            reservationPath: '/events/zcvje2pmyv/slots/4822/reservation',
            confirmationPath: '/events/zcvje2pmyv/slots/4822/reservation_confirmation'},
          { time: '3:50',
            reservationPath: '/events/zcvje2pmyv/slots/4823/reservation',
            confirmationPath: '/events/zcvje2pmyv/slots/4823/reservation_confirmation'},
        ]);
        assert.equal(userToken, 'nzvmpfpq87');
        assert.equal(csrfToken, 'V9xosljRgRw5cYIe2NAw7cdG4/yzQjyXtTQ8ZnwiUD8=');
        done();
      });
    });

    it('fails if event host name does not match', function(done){
      var badHostEvent = _.extend(_.clone(event), {
        host: 'Tom Brow'
      });
      slottd.getSlots(badHostEvent, function(err){
        assert(err);
        done();
      });
    });

  });

  describe('.createReservation', function(){

    var reservationPath = '/events/eoi5le9pl5/slots/5179/reservation',
        userToken = '8ggwcqtxti',
        csrfToken = 'V9xosljRgRw5cYIe2NAw7cdG4/yzQjyXtTQ8ZnwiUD8=';

    it('returns a slot id', function(done){
      nock('http://slottd.com')
        .matchHeader('x-csrf-token', csrfToken)
        .matchHeader('x-requested-with', 'XMLHttpRequest')
        .post(reservationPath, 'user_token=' + userToken)
        .reply(201, {slot_id:5179});

      slottd.createReservation(reservationPath, userToken, csrfToken, function(err, slotId){
        assert.ifError(err);
        assert.equal(5179, slotId);
        done();
      });
    });

    it('fails if slot is already reserved', function(done){
      nock('http://slottd.com')
        .matchHeader('x-csrf-token', csrfToken)
        .matchHeader('x-requested-with', 'XMLHttpRequest')
        .post(reservationPath, 'user_token=' + userToken)
        .reply(400,'{"errors":["Slot::AlreadyReservedException"],"slot_id":"5179","type":"already_reserved"}');
      
      slottd.createReservation(reservationPath, userToken, csrfToken, function(err, slotId){
        assert(err);
        assert(!slotId);
        done();
      });
    });

  });

  describe('.confirmReservation', function(){

    var slotId = 5179,
        name = 'Tom Brow',
        email = 'tom@fiftyfourth.st',
        topic = 'TBD',
        csrfToken = 'V9xosljRgRw5cYIe2NAw7cdG4/yzQjyXtTQ8ZnwiUD8=';
        confirmationUrl = '/events/eoi5le9pl5/slots/5179/reservation_confirmation',
        confirmationBody = querystring.stringify({
          'confirmation[name]': name,
          'confirmation[email]': email,
          'confirmation[discussion_topic]': topic
        });

    it('returns nothing', function(done){
      nock('http://slottd.com')
        .post(confirmationUrl, confirmationBody)
        .reply(201);

      slottd.confirmReservation(confirmationUrl, name, email, topic, csrfToken, function(err){
        assert.ifError(err);
        done();
      });
    });

    it('fails if reservation cannot be confirmed', function(done){
      nock('http://slottd.com')
        .post(confirmationUrl, confirmationBody)
        .reply(400);

      slottd.confirmReservation(confirmationUrl, name, email, topic, csrfToken, function(err){
        assert(err);
        done();
      });
    });

  });

});
