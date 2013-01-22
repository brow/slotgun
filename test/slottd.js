var querystring = require('querystring');
var slottd = require('../lib/slottd');
var assert = require('assert');
var nock = require('nock');
var fs = require('fs');
var _ = require('underscore');

describe('slottd', function(){
  
  describe('.getSlots', function(){

    var event = {
      host: 'Sonal Mane',
      date: '2/7',
      url: 'http://slottd.com/events/eoi5le9pl5/slots'
    };

    before(function(){
      nock('http://slottd.com')
        .persist()
        .get('/events/eoi5le9pl5/slots')
        .reply(200, fs.readFileSync('test/files/slots.html', 'utf8'));
    });

    after(function(){
      nock.cleanAll();
    });

    it('returns slots and a user token', function(done){
      slottd.getSlots(event, function(err, slots, userToken){
        assert.ifError(err);
        assert.deepEqual(slots, [
          { reservationPath: '/events/eoi5le9pl5/slots/5177/reservation',
            confirmationPath: '/events/eoi5le9pl5/slots/5177/reservation_confirmation'},
          { reservationPath: '/events/eoi5le9pl5/slots/5178/reservation',
            confirmationPath: '/events/eoi5le9pl5/slots/5178/reservation_confirmation'},
          { reservationPath: '/events/eoi5le9pl5/slots/5179/reservation',
            confirmationPath: '/events/eoi5le9pl5/slots/5179/reservation_confirmation'},
        ]);
        assert.equal(userToken, '8ggwcqtxti');
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
        userToken = '8ggwcqtxti';

    it('returns a slot id', function(done){
      nock('http://slottd.com')
        .post(reservationPath, 'user_token=' + userToken)
        .reply(201, {slot_id:5179});

      slottd.createReservation(reservationPath, userToken, function(err, slotId){
        assert.ifError(err);
        assert.equal(5179, slotId);
        done();
      });
    });

    it('fails if slot is already reserved', function(done){
      nock('http://slottd.com')
        .post(reservationPath, 'user_token=' + userToken)
        .reply(400,'{"errors":["Slot::AlreadyReservedException"],"slot_id":"5179","type":"already_reserved"}');
      
      slottd.createReservation(reservationPath, userToken, function(err, slotId){
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

      slottd.confirmReservation(confirmationUrl, name, email, topic, function(err){
        assert.ifError(err);
        done();
      });
    });

  it('fails if reservation cannot be confirmed', function(done){
      nock('http://slottd.com')
        .post(confirmationUrl, confirmationBody)
        .reply(200);

      slottd.confirmReservation(confirmationUrl, name, email, topic, function(err){
        assert(err);
        done();
      });
    });

  });

});
