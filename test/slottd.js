var slottd = require('../lib/slottd');
var assert = require('assert');
var nock = require('nock');
var _ = require('underscore');

describe('slottd', function(){
  
  describe('.getSlots', function(){

    var event = {
      host: 'Mark Tebbe',
      date: '1/11',
      url: 'http://slottd.com/events/1t1hissiyi/slots'
    };

    before(function(){
      nock('http://slottd.com')
        .persist()
        .get('/events/1t1hissiyi/slots')
        .reply(200);
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
      slottd.getSlots(_.extend(event, {host:'Tom Brow'}), function(err, slots){
        assert(err);
        done();
      });
    });

    it('fails if event date does not match', function(done){
      slottd.getSlots(_.extend(event, {date:'1/12'}), function(err, slots){
        assert(err);
        done();
      });
    });

  });

});
