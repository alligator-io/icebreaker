var _ = require('../lib/icebreaker')
var test = require('tape')
var util = require('util')

test('pull 1', function (t) {
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

test('pull 2', function (t) {
  t.plan(2)

  _(
    _.chain()
    .count()
    .take(25)
    .asyncMap(function (data, cb) {
      return cb(null, data + 1)
    }),
    _.collect(function (err, data) {
      t.notOk(err)
      console.log(data)
      t.equal(data.length, 25)
    })
  )
})

test('pull 3', function (t) {
  t.plan(2)

  _(
    _.chain()
    .count()
    .take(25)
    .asyncMap(function (data, cb) {
      return cb(null, data + 1)
    })
    .collect(function (err, data) {
      t.notOk(err)
      console.log(data)
      t.equal(data.length, 25)
    })
  )
})
