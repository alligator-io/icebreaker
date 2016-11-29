module.exports = {
  isFunction:require('./isFunction'),
  isPlainObject:require('./isPlainObject'),
  isString:require('./isString'),
  isArray : Array.isArray,
  pair:require('pull-pair'),
  toPull:require('stream-to-pull-stream'),
  cat:require('pull-cat')
}