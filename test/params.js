var test = require('tape')
var _ = require('../lib/icebreaker')

test('params', function(t) {
  t.plan(2)
  _(
  _.params(['hello'],1,2,3,"world",['1','2','3']),
  _.collect(
    function(err, data) {
    t.notOk(err)
    t.deepEqual(data,['hello',1,2,3,"world",'1','2','3'])
  }))
})
