var _ = require('icebreaker')
var test = require('tape')
var util = require('util')
require('tape')('pull 1', function(t) {
  var first = _(
    _.count(),
    _.take(30),
    _.asyncMap(function(data, cb) {
      return cb(null, data + 1)
    })
   )

   _( first,
     _(
       _.collect(function(err, data) {
         t.notOk(err)
         console.log(data)
         t.equal(data.length, 30)
         t.end()
       })
     )
   )

})

require('tape')('pull 2', function(t) {
   _(
     _.chain()
     .count()
     .take(25)
     .asyncMap(function(data, cb) {
       return cb(null, data + 1)
     }),
     _.collect(function(err, data) {
       t.notOk(err)
       console.log(data)
       t.equal(data.length, 25)
       t.end()
     })
   )

})

require('tape')('pull 3', function(t) {

   _(
     _.chain()
     .count()
     .take(25)
     .asyncMap(function(data, cb) {
       return cb(null, data + 1)
     })
     .collect(function(err, data) {
         t.notOk(err)
         console.log(data)
         t.equal(data.length, 25)
         t.end()
       })
   )

})