var stream = require('stream')
var toPullStream = require('stream-to-pull-stream')
var pull = require('pull-stream')
var util = require('util')

function init() {
  if (arguments.length > 0) {
    for ( var key in arguments) {
      if (arguments.hasOwnProperty(key)) {
        var arg = arguments[key]
        if (util.isArray(arg)) {
          if (this._chain === false) this._commands.push(this.values(arg))
          else this.values(arg)
        } else this._commands.push(arg)
      }
    }

    if (this._chain === false) {
      this.pull()
    }
  }
}

function icebreaker() {
  if (!(this instanceof icebreaker)) {
    var i = Object.create(icebreaker.prototype);
    icebreaker.apply(i, [].slice.call(arguments));
    return i
  }

  this._commands = []

  /* jshint eqnull:true */
  if (this._chain == null) this._chain = false

  init.apply(this, [].slice.call(arguments))
}

icebreaker.prototype.add = function() {
  this._commands = this._commands.concat([].slice.call(arguments))
  return this
}

var mixin = icebreaker.mixin = function(obj) {
  for ( var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var value = obj[key]
      if (typeof value === 'function') {
        (function(key, value) {
          icebreaker[key] = function() {
            return value.apply(this, [].slice.call(arguments))
          }
          icebreaker.prototype[key] = function() {
            var r = icebreaker[key].apply(this, [].slice.call(arguments))
            return this._chain === true ? this.add(r) : r
          }
        })(key, value)
      }
    }
  }
}

mixin(pull)

icebreaker.chain = icebreaker.prototype.chain = function() {
  if (!(this instanceof icebreaker)) {
    var i = Object.create(icebreaker.prototype);
    i._chain = true
    icebreaker.apply(i, [].slice.call(arguments));
    return i
  }

  this._chain = true
  init.apply(this, [].slice.call(arguments))
  return this
}

icebreaker.prototype.source = function(s) {
  if (s instanceof stream.Duplex || s instanceof stream.Readable ||
  s instanceof stream.Transform)
    return toPullStream.source.apply(toPullStream, arguments)
  return this.Source.apply(this, arguments)
}

icebreaker.prototype.through = function() {
  return this.Through.apply(this, arguments)
}

icebreaker.prototype.sink = function(str) {
  if (str instanceof stream.Writable)
    return toPullStream.sink.apply(toPullStream, arguments)
  return this.Sink.apply(this, arguments)
}

icebreaker.prototype.pull = function() {
  for ( var key in this._commands) {
    if (this._commands[key] instanceof icebreaker) {
      this._commands[key].pull()
    }
  }
  var p = pull.apply(this, this._commands)
  this.commands = []
  return p
}

mixin({ fork : require('pull-fork') })
mixin({ pair : require('pull-pair')})

module.exports = icebreaker