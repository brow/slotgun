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
      nock.restore();
    });

    it('succeeds if event is accurate', function(done){
      slottd.getSlots(event, function(err, slots){
        assert(!err);
        done();
      });
    });

    it('fails if event host name does not match', function(done){
      var badHostEvent = _.extend(_.clone(event), {
        host: 'Tom Brow'
      });
      slottd.getSlots(badHostEvent, function(err, slots){
        assert(err);
        done();
      });
    });

  });

});
