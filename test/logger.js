var assert = require('assert');
var sinon = require('sinon');
var logger = require('../lib/logger');

describe('logger', function(){

  describe('.log', function(){

    it('prints its argument using console.log', function(){
      var arg = 'printer is on fire';
      sinon.stub(console, 'log');
      logger.log(arg);
      assert(console.log.calledWith(arg));
      console.log.restore();
    });

  });

});
