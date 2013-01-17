var server = require('../lib/server');

describe('Server', function(){

  before(function(){
    server.listen();
  })

  after(function(done){
    server.server.end(done);
  })

})
