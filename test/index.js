var assert = require('assert');
var ok = require('okay');
var util = require('util');
var query = require('../');
var async = require('async');
var sql = require('sql');
var pg = require('pg');
pg.defaults.poolSize = 1;

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

  describe('#toQuery interface', function() {
    before(function(done) {
      query('CREATE TABLE "stuff" (id SERIAL PRIMARY KEY, name TEXT)', done);
    });
    after(function(done) {
      query('DROP TABLE "stuff"', done);
    });
    it('works', function(done) {
      var table = sql.define({
        name: 'stuff',
        columns: ['id', 'name']
      });
      query(table.insert({name: 'brian'}), ok(done, function() {
        query(table.select(), ok(done, function(rows) {
          assert.equal(rows.length, 1);
          assert.equal(rows[0].name, 'brian');
          done();
        }));
      }));
    });
  });

  describe('release on error', function() {
    it('releases client', function(done) {
      var queryText = 'SELECT ASLKJDLKSFJDS';
      query(queryText, function(err) {
        assert(err);
        done();
      });
    });
  });

  describe('before hook', function() {
    after(function() {
      query.before = function() {}
    });
    it('calls hook', function(done) {
      var queryText = 'SELECT $1::text as name';
      query.before = function(query, client) {
        assert(query);
        assert(client);
        assert.equal(query.text, queryText);
        assert.equal(query.values.length, 1);
        assert(client instanceof require('pg').Client);
        query.on('end', function() {
          done();
        });
      };
      query(queryText, ['brian'], function() {
      });
    });
  });
});
