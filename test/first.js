var assert = require('assert');
var ok = require('okay');
var query = require('../');
var pg = require('pg');
pg.defaults.poolSize = 1;

describe('query.first', function() {

  before(function(done) {
    query('CREATE TEMP TABLE something(name text, age int)', ok(done, function() {
      query("INSERT INTO something VALUES ('brian', 30)", function() {
        query("INSERT INTO something VALUES ('aaron', 28)", done)
      })
    }))
  })

  it('returns null with no result', function(done) {
    query.first('SELECT * FROM something WHERE name = \'robot\'', function(err, res) {
      assert.equal(arguments.length, 2)
      assert.ifError(err)
      assert(!res)
      done()
    })
  })

  it('returns first row with 1 result', function(done) {
    query.first('SELECT name FROM something WHERE age = 30', function(err, res) {
      assert.ifError(err)
      assert.equal(res.name, 'brian')
      done()
    })
  })

  it('returns first row if there are more than 1', function(done) {
    query.first('SELECT name FROM something ORDER BY age', ok(done, function(res) {
      assert.equal(res.name, 'aaron')
      done()
    }))
  })

  it('turns non-array values into array values for you', function(done) {
    query.first('SELECT name FROM something WHERE name = $1', 'brian', ok(done, function(res) {
      assert.equal(res.name, 'brian')
      done()
    }))
  })

  //keep this test last. it blows the connection away on error
  //and the temp table is dropped
  it('handles errors as you would expect', function(done) {
    query.first('SELELKJSDLKSDJF SD F', function(err, res) {
      assert(err)
      assert.equal(res, null)
      done()
    })
  })

});
