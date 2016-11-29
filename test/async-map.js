var _ = require('../')
var test = require('tape')

test('async-map', function (t) {
  t.plan(2)

  _(
    _.count(),
    _.take(30),
    _.asyncMap(function (data, cb) {
      return cb(null, data + 1)
    }),
    _.collect(function (err, data) {
      t.notOk(err)
      console.log(data)
      t.equal(data.length, 30)
    })
  )
})
