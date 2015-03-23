var test = require('tape')
var _ = require('../lib/icebreaker')

test('mixin 1', function(t) {
 t.plan(4)

 _.mixin({
   test1:
     _.source(function(s){
       var i = 0
       return function(end,callback){
         if(end) return callback(end)
         if(i++ >3 ) return callback(true)
         callback(null,s +i  )
       }
     })
  })

  _(
    _.test1('_test1-'),
    _.collect(function(err, data) {
      t.notOk(err)
      console.log(data)
      t.deepEqual(data,[ '_test1-1', '_test1-2', '_test1-3', '_test1-4' ])
    })
  )

  _(
    _.chain()
    .test1('test1-')
    .collect(function(err, data) {
      t.notOk(err)
      console.log(data)
      t.deepEqual(data,[ 'test1-1', 'test1-2', 'test1-3', 'test1-4' ])
    })
  )

})

test('mixin 2', function(t) {
 t.plan(4)

 _.mixin({
   test2:{
     deep:_.source(function(s){
       var i = 0
       return function(end,callback){
         if(end) return callback(end)
         if(i-- <-3 ) return callback(true)
         callback(null,s +i  )
       }
     })
   }
 })

  _(
    _.test2.deep('_test2'),
    _.collect(function(err, data) {
      t.notOk(err)
      console.log(data)
      t.deepEqual(data,[ '_test2-1', '_test2-2', '_test2-3', '_test2-4' ])
    })
  )

  _(
    _.chain()
    .test2()
    .deep('test2')
    .collect(function(err, data) {
      t.notOk(err)
      t.deepEqual(data,[ 'test2-1', 'test2-2', 'test2-3', 'test2-4' ])
    })
  )
})
