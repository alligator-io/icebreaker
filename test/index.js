var _ = require('../')
var test = require('tape')
var util = require('util')

test('pull', function (t) {
  t.plan(2)

  var first = _(
    _.count(),
    _.take(30),
    _.asyncMap(function (data, cb) {
      return cb(null, data + 1)
    })
  )

  _(first,
    _(
      _.collect(function (err, data) {
        t.notOk(err)
        console.log(data)
        t.equal(data.length, 30)
      })
    )
  )

})