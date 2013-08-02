//peerDependency - use whichever version is installed
//in the project
var pg = require('pg');

var ok = require('okay');

var query = module.exports = function(text, values, cb) {
  //normalize params
  if(typeof values == 'function') {
    cb = values;
    values = [];
  }
  pg.connect(ok(cb, function(client, done) {
    client.query(text, values, ok(cb, function(res) {
      done();
      cb(null, res.rows, res);
    }));
  }));
};
