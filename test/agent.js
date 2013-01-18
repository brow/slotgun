var Agent = require('../lib/agent');
var assert = require('assert');

describe('Agent', function(){
  
  var agent = new Agent();

  describe('#go', function(){

    it('succeeds if event is accurate', function(done){
      var event = {
        host: 'Mark Tebbe',
        date: '1/11',
        url: 'http://slottd.com/events/1t1hissiyi/slots'
      };
      agent.go(event, function(err){
        assert.ifError(err);
        done();
      })
    });

    it('fails if event host name does not match', function(done){
      var event = {
        host: 'Tom Brow',
        date: '1/11',
        url: 'http://slottd.com/events/1t1hissiyi/slots'
      };
      agent.go(event, function(err){
        assert(err);
        done();
      })
    });

    it('fails if event date does not match', function(done){
      var event = {
        host: 'Mark Tebbe',
        date: '1/12',
        url: 'http://slottd.com/events/1t1hissiyi/slots'
      };
      agent.go(event, function(err){
        assert(err);
        done();
      })
    });

  });

});
