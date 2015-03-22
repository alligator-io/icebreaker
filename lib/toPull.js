var _ = require('./icebreaker')
var stream = require('stream')
var to = require('stream-to-pull-stream')
var Source = _.source
var Through = _.through
var Sink = _.sink
var Pair = _.pair

_.mixin({
  source: function (s) {
    if (s instanceof stream.Stream) {
      if (s.readable) return to.source.apply(this, arguments)
      throw Error('source: node.js stream must be readable')
    }
    return Source.apply(this, arguments)
  },
  through: function (s) {
    if (s instanceof stream.Stream) {
      if (s.readable && s.writable) return Through(to.apply(this, arguments))()
      throw Error('through: node.js stream must be readable and writable')
    }
    return Through.apply(this, arguments)
  },
  sink: function (s) {
    if (s instanceof stream.Stream) {
      if (s.writable) return to.sink.apply(to, arguments)
      throw Error('sink: node.js stream must be writable')
    }
    return Sink.apply(this, arguments)
  },
  pair: function (s) {
    if (s instanceof stream.Stream) {
      if (s.readable && s.writable) return to.duplex.apply(this, arguments)
      throw Error('pair: node.js stream must be readable and writable')
    }
    return Pair.apply(this, arguments)
  }
})
