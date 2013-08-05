//peerDependency - use whichever version is installed
//in the project
var pg = require('pg');

var ok = require('okay');

var query = module.exports = function(text, values, cb) {
  if(text.toQuery) {
    cb = values;
    var q = text.toQuery();
    text = q.text;
    values = q.values;
  } else if(typeof values == 'function') {
    //normalize params
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
