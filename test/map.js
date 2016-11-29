var test = require('tape')
var _ = require('../')

test('map', function (t) {
  t.plan(2)

  _(
    [1, 2, 3],
    _.map(function (m) {
      return m * 10
    }),
    _.collect(function (err, data) {
      t.notOk(err)
      t.deepEqual(data, [10, 20, 30])
    })
  )
})