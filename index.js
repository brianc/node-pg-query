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
  pg.connect(query.connectionParameters, ok(cb, function(client, done) {
    var onError = function(err) {
      done(err);
      cb(err);
    };
    var onSuccess = function(res) {
      done();
      cb(null, res.rows, res);
    };
    var q = client.query(text, values, ok(onError, onSuccess));
    query.before(q, client);
  }));
};

query.before = function(query, client) {

};
