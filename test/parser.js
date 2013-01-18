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

  });

  describe('.parse', function(){

    it('should return no events for an empty string', function(){
      assert.deepEqual(parser.parse(""), []);
    })

    it('should parse a single event for a single host', function(){
      assert.deepEqual(parser.parse(readTestFile('single_event.eml')), [{
        host: 'Mark Tebbe',
        date: '1/11',
        url: 'http://slottd.com/events/1t1hissiyi/slots'
      }]);
    });

  })

})


