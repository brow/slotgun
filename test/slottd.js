var slottd = require('../lib/slottd');
var assert = require('assert');
var nock = require('nock');
var fs = require('fs');
var _ = require('underscore');

describe('slottd', function(){
  
  describe('.getReservationPaths', function(){

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

    it('returns reservation paths and a user token', function(done){
      slottd.getReservationPaths(event, function(err, reservationPaths, userToken){
        assert.ifError(err);
        assert.deepEqual(reservationPaths, [
           '/events/eoi5le9pl5/slots/5177/reservation',
           '/events/eoi5le9pl5/slots/5178/reservation',
           '/events/eoi5le9pl5/slots/5179/reservation',
        ]);
        assert.equal(userToken, '8ggwcqtxti');
        done();
      });
    });

    it('fails if event host name does not match', function(done){
      var badHostEvent = _.extend(_.clone(event), {
        host: 'Tom Brow'
      });
      slottd.getReservationPaths(badHostEvent, function(err){
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
        .reply(201, '{"slot_id":"5179"}');

      slottd.createReservation(reservationPath, userToken, function(err, slotId){
        assert.ifError(err);
        assert.equal(5179, slotId);
        done();
      });
    });

    it('fails if slot is taken', function(done){
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

    it('returns nothing');

    it('fails if reservation cannot be confirmed');

  });

});
