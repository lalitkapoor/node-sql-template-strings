'use strict'
let assert = require('assert')
let SQL = require('..')

describe('SQL', () => {
  it('should work with a simple query', () => {
    const query = SQL`SELECT * FROM table`
    assert.equal(query.text, 'SELECT * FROM table')
    assert.deepEqual(query.values, [])
  })

  it('should work with a query with values', () => {
    const value = 1234
    const query = SQL`SELECT * FROM table WHERE column = ${value}`
    assert.equal(query.text, 'SELECT * FROM table WHERE column = $1')
    assert.deepEqual(query.values, [value])
  })

  it('should work with falsy values', () => {
    const value1 = false
    const value2 = null
    const query = SQL`SELECT * FROM table WHERE column1 = ${value1} AND column2 = ${value2}`
    assert.equal(query.text, 'SELECT * FROM table WHERE column1 = $1 AND column2 = $2')
    assert.deepEqual(query.values, [value1, value2])
  })

  it('should work with nested SQL statements', () => {
    const query = SQL`INSERT INTO values (${SQL`(${1}, ${2}, ${SQL`${3}, ${4}, ${5}`})`}, (6, 7, ${SQL`${8}`}, 9, 10))`
    assert.equal(query.text, 'INSERT INTO values (($1, $2, $3, $4, $5), (6, 7, $6, 9, 10))')
    assert.deepEqual(query.values, [1,2,3,4,5,8])
  })

  describe('SQL.values', () => {
    it('should work with a matrix of values', () => {
      const vals = [ [1,2,3], [4,5,6] ]
      const query = SQL`INSERT INTO values (${SQL.values(vals)})`
      assert.equal(query.text, 'INSERT INTO values (($1, $2, $3), ($4, $5, $6))')
      assert.deepEqual(query.values, [1,2,3,4,5,6])
    })
  })

  describe('append()', () => {
    it('should return this', () => {
      const query = SQL`SELECT * FROM table`
      assert.strictEqual(query, query.append('whatever'))
    })

    it('should append a second SQLStatement', () => {
      const value1 = 1234
      const value2 = 5678
      const query = SQL`SELECT * FROM table WHERE column = ${value1}`.append(SQL` AND other_column = ${value2}`)
      assert.equal(query.text, 'SELECT * FROM table WHERE column = $1 AND other_column = $2')
      assert.deepEqual(query.values, [value1, value2])
    })

    it('should append a string', () => {
      const value = 1234
      const query = SQL`SELECT * FROM table WHERE column = ${value}`.append(' ORDER BY other_column')
      assert.equal(query.text, 'SELECT * FROM table WHERE column = $1 ORDER BY other_column')
      assert.deepEqual(query.values, [value])
    })
  })

  describe('setName()', () => {
    it('should set the name and return this', () => {
      assert.equal(SQL`SELECT * FROM table`.setName('my_query').name, 'my_query')
    })
  })
})
