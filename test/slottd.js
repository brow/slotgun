var slottd = require('../lib/slottd');
var assert = require('assert');
var nock = require('nock');
var fs = require('fs');
var _ = require('underscore');

describe('slottd', function(){
  
  describe('.getReservationUrls', function(){

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
      nock.restore();
    });

    it('returns reservation URLs and a user token', function(done){
      slottd.getReservationUrls(event, function(err, reservationUrls, userToken){
        assert.deepEqual(reservationUrls, [
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
      slottd.getReservationUrls(badHostEvent, function(err){
        assert(err);
        done();
      });
    });

  });

});
