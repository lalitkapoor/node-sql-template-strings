# SQL Template Strings

[![npm](https://img.shields.io/npm/v/sql-template-strings.svg?maxAge=2592000)](https://www.npmjs.com/package/sql-template-strings)
[![downloads](https://img.shields.io/npm/dm/sql-template-strings.svg?maxAge=2592000)](https://www.npmjs.com/package/sql-template-strings)
[![build](https://travis-ci.org/felixfbecker/node-sql-template-strings.svg?branch=master)](https://travis-ci.org/felixfbecker/node-sql-template-strings)
[![codecov](https://codecov.io/gh/felixfbecker/node-sql-template-strings/branch/master/graph/badge.svg)](https://codecov.io/gh/felixfbecker/node-sql-template-strings)
[![dependencies](https://david-dm.org/felixfbecker/node-sql-template-strings.svg)](https://david-dm.org/felixfbecker/node-sql-template-strings)
![node](http://img.shields.io/node/v/sql-template-strings.svg)
[![license](https://img.shields.io/npm/l/sql-template-strings.svg?maxAge=2592000)](https://github.com/felixfbecker/node-sql-template-strings/blob/master/LICENSE.txt)
[![chat: on gitter](https://badges.gitter.im/felixfbecker/node-sql-template-strings.svg)](https://gitter.im/felixfbecker/node-sql-template-strings?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[API Documentation](http://node-sql-template-strings.surge.sh/)

A simple yet powerful module to allow you to use ES6 tagged template strings for prepared/escaped statements.  
Works with [postgres](https://www.npmjs.com/package/pg).

Example for escaping queries (callbacks omitted):

```js
const SQL = require('sql-template-strings')

const book = 'harry potter'
const author = 'J. K. Rowling'

pg.query('SELECT author FROM books WHERE name = $1 AND author = $2', [book, author])
// is equivalent to
pg.query(SQL`SELECT author FROM books WHERE name = ${book} AND author = ${author}`)
```

This might not seem like a big deal, but when you do an INSERT with a lot columns writing all the placeholders becomes a nightmare:

```js
db.query(
  'INSERT INTO books (name, author, isbn, category, recommended_age, pages, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
  [name, author, isbn, category, recommendedAge, pages, price]
)
// is better written as
db.query(SQL`
  INSERT
  INTO    books
          (name, author, isbn, category, recommended_age, pages, price)
  VALUES  (${name}, ${author}, ${isbn}, ${category}, ${recommendedAge}, ${pages}, ${price})
`)
```
Also template strings support line breaks, while normal strings do not.

## How it works
The SQL template string tag transforms the template string and returns an _object_ that is understood by postgres:

```js
const query = SQL`SELECT author FROM books WHERE name = ${book} AND author = ${author}`
typeof query // => 'object'
query.text   // => 'SELECT author FROM books WHERE name = $1 AND author = $2'
query.values // => ['harry potter', 'J. K. Rowling']
```

## Inserting multiple values with `SQL.values()`
```js
db.query(SQL`INSERT INTO values (${SQL.values([ [1,2,3], [4,5,6] ])})`
```

## Building complex queries with `append()`
It is also possible to build queries by appending another query or a string with the `append()` method (returns `this` for chaining):

```js
query.append(SQL`AND genre = ${genre}`).append(' ORDER BY rating')
query.text   // => 'SELECT author FROM books WHERE name = $1 AND author = $2 AND genre = $3 ORDER BY rating'
query.values // => ['harry potter', 'J. K. Rowling', 'Fantasy'] ORDER BY rating
```

This allows you to build complex queries without having to care about the placeholder index or the values array:

```js
const query = SQL`SELECT * FROM books`
if (params.name) {
  query.append(SQL` WHERE name = ${params.name}`)
}
query.append(SQL` LIMIT 10 OFFSET ${params.offset || 0}`)
```

## Raw values
Some values cannot be replaced by placeholders in prepared statements, like table names.
`append()` replaces the `SQL.raw()` syntax from version 1, just pass a string and it will get appended raw.

 > Please note that when inserting raw values, you are responsible for quoting and escaping these values with proper escaping functions first if they come from user input (E.g. `pg.escapeIdentifier()`).
 > Also, executing many prepared statements with changing raw values in a loop will quickly overflow the prepared statement buffer (and destroy their performance benefit), so be careful.

```js
const table = 'books'
const order = 'DESC'
const column = 'author'

db.query(SQL`SELECT * FROM "`.append(table).append(SQL`" WHERE author = ${author} ORDER BY ${column} `).append(order))

// escape user input manually
pg.query(SQL`SELECT * FROM `.append(pg.escapeIdentifier(someUserInput)).append(SQL` WHERE name = ${book} ORDER BY ${column} `).append(order))
```

## Binding Arrays

To bind the array dynamically as a parameter use ANY (PostgreSQL only):
```js
const authors = ['J. K. Rowling', 'J. R. R. Tolkien']
const query = SQL`SELECT name FROM books WHERE author = ANY(${authors})`
query.text   // => 'SELECT name FROM books WHERE author = ANY($1)'
query.values // => ['J. K. Rowling', 'J. R. R. Tolkien']
```

## Prepared Statements in Postgres
Postgres requires prepared statements to be named, otherwise the parameters will be escaped and replaced on the client side.
You can set the name with the `setName()` method:

```js
// old way
pg.query({name: 'my_query', text: 'SELECT author FROM books WHERE name = $1', values: [book]})

// with template strings
pg.query(SQL`SELECT author FROM books WHERE name = ${book}`.setName('my_query'))
```
You can also set the name property on the statement object directly or use `Object.assign()`.


## Editor Integration

- **Sublime Text**: [javascript-sql-sublime-syntax](https://github.com/AsterisqueDigital/javascript-sql-sublime-syntax)
- **Vim**: [vim-javascript-sql](https://github.com/statico/vim-javascript-sql)

## Contributing
 - Tests are written using [mocha](https://www.npmjs.com/package/mocha)
 - You can use `npm test` to run the tests and check coding style
 - Since this module is only compatible with ES6 versions of node anyway, use all the ES6 goodies
 - Pull requests are welcome :)
