var _ = require('../lib/icebreaker')
var test = require('tape')

test('pair', function (t) {
  t.plan(2)
  var p = _.pair()
  _(_.count(), _.take(100), p)
  _(
    p,
    _.reduce(function (a) {
      return ++a
    },
    0,
    function (err, c) {
      t.notOk(err)
      t.equal(c, 100)
    })
  )
})
