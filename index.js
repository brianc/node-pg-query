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
var when = require('when');
var nodefn = require('when/node');
var util = require('util')

var Query = function() {
  this.name = null;
  this.text = null;
  this.values = null;
}

var query = module.exports = function(text, values, cb) {
  var q = new Query();

  //normalize params
  if(typeof values == 'function') {
    cb = values;
    values = [];
  }

  if(typeof text === 'string') {
    q.text = text;
    q.values = values;
  } else if(typeof text === 'object') {
    //support toQuery and object style interface
    q = text.toQuery ? text.toQuery() : text;
  }


  var defer;
  if(typeof cb === 'undefined' && !q.submit) {
    defer = when.defer();
    cb = nodefn.createCallback(defer.resolver);
  }

  (query.pg || pg).connect(query.connectionParameters, ok(cb, function(client, done) {
    var onError = function(err) {
      done(err);
      cb(err);
    };
    var onSuccess = function(res) {
      done();
      cb(null, res.rows, res);
    };
    var qry = client.query(q, ok(onError, onSuccess));
    query.before(qry, client);
  }));
  if(defer) {
    return defer.promise;
  }
  return q;
};

query.before = function(query, client) {

};

query.first = function(text, values, cb) {
  if(typeof values == 'function') {
    cb = values
    values = []
  }
  if(values && !util.isArray(values)) {
    values = [values]
  }
  query(text, values, function(err, rows) {
    return cb(err, rows ? rows[0] : null)
  })
}
