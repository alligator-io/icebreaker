var _ = require('./icebreaker')
var stream = require('stream')
var to = require('stream-to-pull-stream')
var Source = _.source
var Through = _.through
var Sink = _.sink
var Pair = _.pair

function done(cb){
  return cb?function(end){
    if(cb){ cb(end); cb=null }
  }:cb
}

_.mixin({
  source: function (s) {
    if (s instanceof stream.Stream) {
      if (s.readable) return to.source(s)
      throw Error('source: node.js stream must be readable')
    }
    return Source.apply(this, arguments)
  },
  through: function (s,cb) {
    if (s instanceof stream.Stream) {
      if (s.readable && s.writable) return Through(to(s,done(cb)))()
      throw Error('through: node.js stream must be readable and writable')
    }
    return Through.apply(this, arguments)
  },
  sink: function (s,cb) {
    if (s instanceof stream.Stream) {
      if (s.writable) return to.sink(s, done(cb))
      throw Error('sink: node.js stream must be writable')
    }
    return Sink.apply(this, arguments)
  },
  pair: function (s,cb) {
    if (s instanceof stream.Stream) {
      if (s.readable && s.writable) return to.duplex(s,done(cb))
      throw Error('pair: node.js stream must be readable and writable')
    }
    return Pair.apply(this, arguments)
  }
})
