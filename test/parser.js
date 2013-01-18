var _ = require('underscore');
var fs = require('fs');
var assert = require('assert');
var path = require('path');
var parser = require('../lib/parser');

function readTestFile(filename){
  return fs.readFileSync(path.join('test/files/', filename), 'utf8');
}

describe('parser', function(){

  describe('.parseHostLine', function(){

    it('should return the name of the host', function(){
      assert.deepEqual(
        parser.parseHostLine("Mark Tebbe [http://r20.rs6.net/tn.jsp?e=0019h-okzdG8p-lfO3A_dB766zDE04SBwAUX4jxpxsdv-3S7uaY4Bbt-n6gsnZWMQU56qPNP_HfJiHwR3oud15AwJIYhLjRDUtSQDCe-jbInAZyU3JAyEL7txsy7cxFxU7g],"),
        "Mark Tebbe"
      );
    });

    it('should still parse if the trailing comma is missing', function(){
      assert.deepEqual(
        parser.parseHostLine("Connie Capone [http://r20.rs6.net/tn.jsp?e=0019h-okzdG8p_dLH8S7ZvpCqm3T6CgENA7Za_5SK7SEaZCN-796cB-Tz7tlAGEGrZgbfK2_4B_FvoPDnv74Pi_PAX4FwryqrvvV3nI4qoZOsXqzOhbSnj6RYUXVpovp3tuWyjrgtW2kwU=]"),
        "Connie Capone"
      );
    });

  });

  describe('.parseEventLine', function(){

    it('should return a partial event object', function(){
      assert.deepEqual(
        parser.parseEventLine("1/11 10-noon  http://slottd.com/events/1t1hissiyi/slots [http://r20.rs6.net/tn.jsp?e=0019h-okzdG8p_VckyVyjz5ZmPX6bDpHiS_-XGV74HumdcBs7k04Pr2O5EmM5XNKvKSy3XoQQOgmfMR6eur29IQnuapTrJIoW9DBxgLJjSwhi__s-SbMNdaIQHsMmiFXHZH71Aqi_Rh0PY=]"),
        {
          date: '1/11',
          url: 'http://slottd.com/events/1t1hissiyi/slots'
        }
      );
    });

    it('should still parse if date is followed by a comma', function(){
      assert.deepEqual(
        parser.parseEventLine("1/9, 1-2:30 http://slottd.com/events/ibq7biuzqp/slots [http://r20.rs6.net/tn.jsp?e=0019h-okzdG8p9ON493min5wy1d0QN1O69tqGcamqH80HvatCKxICWPiXD3bvfontsuC9vg5JKN3JTjRYCrAHpuXYlq6U5lddQmosgiXuP17eQ22Ve18hnqQ5po0Zd42-4AqmT8Y0RxtO4=]"),
        {
          date: '1/9',
          url: 'http://slottd.com/events/ibq7biuzqp/slots'
        }
      );
    });

  });

  describe('.parseEmailBody', function(){

    it('should return no events for an empty string', function(){
      assert.deepEqual(parser.parseEmailBody(""), []);
    })

    it('should not parse an event not associated with a host', function(){
      assert.deepEqual(parser.parseEmailBody(readTestFile('event_no_host.txt')), []);
    });

    it('should parse a single event for a single host', function(){
      assert.deepEqual(parser.parseEmailBody(readTestFile('single_event.txt')), [{
        host: 'Mark Tebbe',
        date: '1/11',
        url: 'http://slottd.com/events/1t1hissiyi/slots'
      }]);
    });

  })

  describe('.parseEmail', function(){

    it('should parse all events from a real email', function(done){
      parseEmail(readTestFile('real_email.eml'), function(events){
        assert.equal(34, events.length);
        assert.deepEqual(events[0], {
          host: 'Mark Tebbe',
          date: '1/11',
          url: 'http://slottd.com/events/1t1hissiyi/slots'
        });
        assert.deepEqual(events[2], {
          host: 'Bernhard Kappe',
          date: '1/17',
          url: 'http://slottd.com/events/p72hlsg5nf/slots'
        });
        assert.deepEqual(events[33], {
          host: 'Nik Rokop',
          date: '1/18',
          url: 'http://slottd.com/events/7mn6ttpwbq/slots'
        });
        done();
      });
    });

  });

})
