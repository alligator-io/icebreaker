var _ = require('../')
var test = require('tape')
require('tape')('async-map 1', function(t) {
  _(_.chain()
  .count()
  .take(30)
  .asyncMap(function(data, callback) {
    return callback(null, data + 1)
  })
  .collect(function(err, data) {
    t.notOk(err)
    console.log(data)
    t.equal(data.length, 30)
    t.end()
  })
 )
})

require('tape')('async-map 2', function(t) {
  _(_.count(),
  _.take(30),
  _.asyncMap(function(data, cb) {
    return cb(null, data + 1)
  }),
  _.collect(function(err, data) {
    t.notOk(err)
    console.log(data)
    t.equal(data.length, 30)
    t.end()
  }))
})
