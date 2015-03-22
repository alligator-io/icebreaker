var pull = require('pull-stream')
var inherits = require('inherits')
var isArray = require('isarray')

function init() {
  if (arguments.length > 0) {
    for (var key in arguments) {
      if (arguments.hasOwnProperty(key)) {
        var arg = arguments[key]
        if (isArray(arg) || typeof arg === 'string' ||
          typeof arg === 'number') {
          if (this._chain === false) this._commands.push(this.params(arg))
          else this.params(arg)
        } else this._commands.push(arg)
      }
    }

    if (this._chain === false) {
      return this.pull()
    }
  }
}

function icebreaker() {
  if (!(this instanceof icebreaker)) {
    var i = Object.create(icebreaker.prototype);
    var p = icebreaker.apply(i, [].slice.call(arguments))
    if (p) return p
    return i
  }

  this._commands = []

  /* jshint eqnull:true */
  if (this._chain == null) this._chain = false

  var p = init.apply(this, [].slice.call(arguments))
  if (p) return p
}

icebreaker.prototype.add = function () {
  this._commands = this._commands.concat([].slice.call(arguments))
  return this
}

var mixin = icebreaker.mixin = function (obj, dest) {
  if (!dest) dest = icebreaker

  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var value = obj[key]

      if (typeof value === 'function' && typeof key === 'string') {
        (function (key, value) {
          dest[key] = function () {
            return value.apply(this, [].slice.call(arguments))
          }
          dest.prototype[key] = function () {
            var r = dest[key].apply(this, [].slice.call(arguments))
            return this._chain === true ? this.add(r) : r
          }
        })(key, value)
      } else if (typeof value === 'object' && key !== 'prototype') {;
        (function (key, value) {
          dest[key] = value
          var w = function () {
            if (!(this instanceof w)) return new w()
            icebreaker.call(this)
          }

          inherits(w, icebreaker)
          if (Object.keys(value).length > 0)
            icebreaker.mixin(value, w)
          else {
            dest[key] = w
          }

          dest.prototype[key] = function () {
            var s = new w()
            s._commands = this._commands
            s._chain = this._chain
            return s
          }
        })(key, value)
      }
    }
  }
}

icebreaker.prototype.pull = function () {
  if (isArray(this._commands))
    for (var key in this._commands) {
      if (this._commands[key] instanceof icebreaker) {
        var r = this._commands[key].pull()
        if (r) this._commands[key] = r
      }
    }

  var p = pull.apply(pull, this._commands)

  this._commands = []

  return p
}

mixin(pull)

mixin({
  fork: require('pull-fork'),
  pair: function (s) {
    if (s instanceof stream.Duplex) return toPullStream.duplex(s)
    return require('pull-pair').apply(this, arguments)
  },
  source: pull.Source,
  through: pull.Through,
  sink: icebreaker.Sink,
  chain: function () {
    if (!(this instanceof icebreaker)) {
      var i = Object.create(icebreaker.prototype);
      i._chain = true
      icebreaker.apply(i, [].slice.call(arguments));
      return i
    }

    this._chain = true
    init.apply(this, [].slice.call(arguments))
    return this
  },
  params: function () {
    return icebreaker
      .chain()
      .values([].slice.call(arguments))
      .map(function (arg) {
        if (!isArray(arg)) return [arg]
        return arg
      })
      .flatten()
      .pull()
  },
  cleanup: function (func) {
    return function (read) {
      var ended
      return function (abort, callback) {
        read(abort, function next(end, data) {
          if (ended) return
          if (end) {
            func(end)
            return callback(ended = end)
          }
          callback(end, data)
        })
      }
    }
  }
})

module.exports = icebreaker
