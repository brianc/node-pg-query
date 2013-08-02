var assert = require('assert');
var ok = require('okay');
var util = require('util');
var query = require('../');
var async = require('async');

describe('query', function() {
  describe('with no values', function() {
    it('works', function(done) {
      query('SELECT NOW() as when', function(err, rows, result) {
        if(err) return done(err);
        assert(util.isArray(rows));
        assert.equal(rows.length, 1);
        assert.equal(rows, result.rows);
        done();
      });
    });
  });

  describe('with values', function() {
    it('works', function(done) {
      query('SELECT $1::text as name', ['brian'], ok(done, function(rows, result) {
        assert.equal(rows.length, 1);
        assert.equal(rows[0].name, 'brian');
        done();
      }));
    });
  });

  describe('domain binding', function() {
    it('sticks on proper domain', function(done) {
      var domain = require('domain').create();
      domain.run(function() {
        var existingDomain = process.domain;
        var runQuery = function(n, next) {
          query('SELECT NOW()', function(err, rows) {
            assert.equal(existingDomain, process.domain);
            next();
          });
        };
        async.times(10, runQuery, function(err) {
          if(err) return done(err);
          assert.equal(existingDomain, process.domain);
          done();
        });
      });
    });
  });
});
