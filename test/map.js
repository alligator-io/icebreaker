var test = require('tape')
var _ = require('icebreaker')

test('map 1', function(t) {
  _([ 1, 2, 3 ],
  _.map(function(m) { return m * 10 }),
  _.collect(function(err, data) {
    t.notOk(err)
    t.deepEqual(data, [ 10, 20, 30 ])
    t.end()
  }))
})

test('map 2', function(t) {
  _(_.chain([ 1, 2, 3 ])
  .map(function(m) { return m * 10 })
  .collect(function(err, data) {
    t.notOk(err)
    t.deepEqual(data, [ 10, 20, 30 ])
    t.end()
  }))
})