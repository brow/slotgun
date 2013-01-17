var simplesmtp = require('simplesmtp');

module.exports = simplesmtp.createSimpleServer({}, function(req){
  req.accept();
})
