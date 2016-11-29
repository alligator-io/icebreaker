var test = require('tape')
var _ = require('../')

test('params', function(t) {
  t.plan(2)
  _(
   ['hello'],1,2,3,"world",['1','2','3'],true,false,null,undefined,
  _.collect(
    function(err, data) {
    t.notOk(err)
    t.deepEqual(data,['hello',1,2,3,"world",'1','2','3',true,false,null,undefined])
  }))
})