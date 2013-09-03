//peerDependency - use whichever version is installed
//in the project
try {
  var pg = require('pg');
} catch(e) {
  try {
    var pg = require('pg.js');
  } catch(e) {
    throw new Error("Could not require pg or pg.js - please install one or the other")
  }
}

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
