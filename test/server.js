var Server = require('../lib/server');

describe('Server', function(){

  var server = new Server();

  before(function(){
    server.listen(8825);
  })

  after(function(done){
    server.end(done);
  })

})
