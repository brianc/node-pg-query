# pg-query

Run queries with node-postgres with less boilerplate.  node-posgres is low level by design and rather verbose.

This is a simple abstraction I've spun into a module after implementing something like this in most of my projects.

## install

`npm install pg-query`

## use

```js
var query = require('pg-query');

query('SELECT NOW()', function(err, rows, result) {
  assert.equal(rows, result.rows);
});

```

Notice the callback is called with 3 parameters.  
First the `error` argument.  
Next the __rows__ returned by the query.  
Finally the full __result__ object which contains the same reference to the rows at `result.rows`

## more examples
```js
var query = require('pg-query');
query.connectionParameters = 'postgres://user:password@host:5432/database';

//accepts optional array of values as 2nd parameter for parameterized queries
query('SELECT $1::text as name', ['brian'], function(err, rows, result) {
  
});
```

## comments

`pg-query` is domain aware so your callback will always be called in the correct domain.  
If you're not using domains it will gracefully ignore them.

`pg-query` uses whichever version of node-postgres you have installed in your project.

`pg-query` uses `pg.defaults` and/or [environment variables](http://www.postgresql.org/docs/9.2/static/libpq-envars.html) to connect.

`pg-query` uses __a random pooled database client for each query__.  
If you're using a transaction (eg `BEGIN`/`COMMIT`) you need to check out a client from the pool manually.  
__Repeat__: DO NOT USE THIS FOR RUNNING TRANSACTIONS

## todo

- Accept query object
- Accept anything that responds to `.toQuery` ([node-sql](https://github.com/brianc/node-sql) queries, etc)
- Possibly add some way to configure connection parameters

## license

MIT
