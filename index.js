'use strict'

class SQLStatement {
  /**
   * @param {string[]} strings
   * @param {any[]} params
   */
  constructor(strings, params) {
    this.strings = strings
    this.params = params
  }

  get text() {
    let parameterIndex = 0
    let text = ""

    let build = function(sqlStatement) {
      sqlStatement.strings.forEach((string, index) => {
        text += string
        if (index >= sqlStatement.params.length) return // no more values left
        let param = sqlStatement.params[index]
        if (param instanceof SQLStatement) {
          build(param)
        } else {
          text += `$${++parameterIndex}`
        }
      })
    }

    build(this)
    return text
  }

  get values() {
    let values = []

    let build = function(sqlStatement) {
      sqlStatement.params.forEach((param) => {
        if (param instanceof SQLStatement) {
          build(param)
        } else {
          values.push(param)
        }
      })
    }

    build(this)
    return values
  }

  /**
   * @param {SQLStatement|string} statement
   * @returns {this}
   */
  append(statement) {
    if (statement instanceof SQLStatement) {
      this.strings[this.strings.length - 1] += statement.strings[0]
      this.strings.push.apply(this.strings, statement.strings.slice(1))
      this.params.push.apply(this.params, statement.values)
    } else {
      this.strings[this.strings.length - 1] += statement
    }
    return this
  }

  /**
   * @param {string} name
   * @returns {this}
   */
  setName(name) {
    this.name = name
    return this
  }
}

/**
 * @param {string[]} strings
 * @param {...any} params
 * @returns {SQLStatement}
 */
function SQL(strings) {
  return new SQLStatement(strings.slice(0), Array.from(arguments).slice(1))
}

SQL.values = function(matrix) {
  if (matrix.length === 1) {
    const row = matrix[0]
    let strings = ['']
    row.forEach((element) => strings.push(', '))
    strings.pop()
    return new SQLStatement(strings, row)
  }

  let statements = matrix.map((row) => {
    let strings = ['(']
    row.forEach((element) => strings.push(', '))
    strings.pop()
    strings.push(')')
    return new SQLStatement(strings, row)
  })
  
  return statements.reduce((prev, curr) => {
    return prev.append(', ').append(curr)
  })
}

module.exports = SQL
module.exports.SQL = SQL
module.exports.default = SQL
module.exports.SQLStatement = SQLStatement