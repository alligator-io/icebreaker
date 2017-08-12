(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.icebreaker = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
 'use strict'
 module.exports = require('./pull');

;[
    require('pull-stream/sources'),
    require('pull-stream/throughs'),
    require('pull-stream/sinks'),
    require('./util'),
    require('./sources')
    
].forEach(function(streams){
    for(var k in streams) module.exports[k] = streams[k]
})

},{"./pull":40,"./sources":41,"./util":44,"pull-stream/sinks":14,"pull-stream/sources":21,"pull-stream/throughs":30}],2:[function(require,module,exports){

function isFunction (f) {
  return 'function' === typeof f
}

function isDuplex (d) {
  return 'object' === typeof d && isSource(d.source) && isSink(d.sink)
}

function isSource (s) {
  return isFunction(s) && s.length === 2
}

function isSink (s) {
  return isFunction(s) && s.length === 1
}

exports.isDuplex = isDuplex
exports.isSource = isSource
exports.isSink = isSink
//can't do is through, it will appear as a sink til you git it a source.


},{}],3:[function(require,module,exports){

var looper = module.exports = function (fun) {
  (function next () {
    var loop = true, returned = false, sync = false
    do {
      sync = true; loop = false
      fun.call(this, function () {
        if(sync) loop = true
        else     next()
      })
      sync = false
    } while(loop)
  })()
}

},{}],4:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
var noop = function () {}

function abortAll(ary, abort, cb) {
  var n = ary.length
  if(!n) return cb(abort)
  ary.forEach(function (f) {
    if(f) f(abort, next)
    else next()
  })

  function next() {
    if(--n) return
    cb(abort)
  }
  if(!n) next()
}

module.exports = function (streams) {
  return function (abort, cb) {
    ;(function next () {
      if(abort)
        abortAll(streams, abort, cb)
      else if(!streams.length)
        cb(true)
      else if(!streams[0])
        streams.shift(), next()
      else
        streams[0](null, function (err, data) {
          if(err) {
            streams.shift() //drop the first, has already ended.
            if(err === true) next()
            else             abortAll(streams, err, cb)
          }
          else
            cb(null, data)
        })
    })()
  }
}



},{}],6:[function(require,module,exports){

var pushable = require('pull-pushable')

module.exports = function () {
  var listeners = []

  function notify (message) {
    // notify by pushing to all listeners
    for (var i = 0; i < listeners.length; i++) {
      listeners[i].push(message)
    }
    return message
  }

  notify.listen = function () {
    // create listener with `onClose` handler
    var listener = pushable(function onClose () {
      // if listener is found, delete from list
      var index = listeners.indexOf(listener)
      if (index !== -1) listeners.splice(index, 1)
    })
    listeners.push(listener)
    return listener
  }

  notify.abort = function (err) {
    // abort by ending all listeners
    while (listeners.length) listeners[0].end(err)
  }

  notify.end = function () {
    return notify.abort(true)
  }

  return notify
}

},{"pull-pushable":8}],7:[function(require,module,exports){
'use strict'

//a pair of pull streams where one drains from the other
module.exports = function () {
  var _read, waiting
  function sink (read) {
    if('function' !== typeof read)
      throw new Error('read must be function')

    if(_read)
      throw new Error('already piped')
    _read = read
    if(waiting) {
      var _waiting = waiting
      waiting = null
      _read.apply(null, _waiting)
    }
  }
  function source (abort, cb) {
    if(_read)
      _read(abort, cb)
    else
      waiting = [abort, cb]
  }

  return {
    source: source, sink: sink
  }
}


},{}],8:[function(require,module,exports){
module.exports = pullPushable

function pullPushable (separated, onClose) {
  if (typeof separated === 'function') {
    onClose = separated
    separated = false
  }

  // create a buffer for data
  // that have been pushed
  // but not yet pulled.
  var buffer = []

  // a pushable is a source stream
  // (abort, cb) => cb(end, data)
  //
  // when pushable is pulled,
  // keep references to abort and cb
  // so we can call back after
  // .end(end) or .push(data)
  var abort, cb
  function read (_abort, _cb) {
    if (_abort) {
      abort = _abort
      // if there is already a cb waiting, abort it.
      if (cb) callback(abort)
    }
    cb = _cb
    drain()
  }

  var ended
  function end (end) {
    ended = ended || end || true
    // attempt to drain
    drain()
  }

  function push (data) {
    if (ended) return
    // if sink already waiting,
    // we can call back directly.
    if (cb) {
      callback(abort, data)
      return
    }
    // otherwise push data and
    // attempt to drain
    buffer.push(data)
    drain()
  }

  // Return functions separated from source { push, end, source }
  if (separated) {
    return { push: push, end: end, source: read }
  }

  // Return normal
  read.push = push
  read.end = end
  return read

  // `drain` calls back to (if any) waiting
  // sink with abort, end, or next data.
  function drain () {
    if (!cb) return

    if (abort) callback(abort)
    else if (!buffer.length && ended) callback(ended)
    else if (buffer.length) callback(null, buffer.shift())
  }

  // `callback` calls back to waiting sink,
  // and removes references to sink cb.
  function callback (err, val) {
    var _cb = cb
    // if error and pushable passed onClose, call it
    // the first time this stream ends or errors.
    if (err && onClose) {
      var c = onClose
      onClose = null
      c(err === true ? null : err)
    }
    cb = null
    _cb(err, val)
  }
}

},{}],9:[function(require,module,exports){
'use strict'

module.exports = function pull (a) {
  var length = arguments.length
  if (typeof a === 'function' && a.length === 1) {
    var args = new Array(length)
    for(var i = 0; i < length; i++)
      args[i] = arguments[i]
    return function (read) {
      if (args == null) {
        throw new TypeError("partial sink should only be called once!")
      }

      // Grab the reference after the check, because it's always an array now
      // (engines like that kind of consistency).
      var ref = args
      args = null

      // Prioritize common case of small number of pulls.
      switch (length) {
      case 1: return pull(read, ref[0])
      case 2: return pull(read, ref[0], ref[1])
      case 3: return pull(read, ref[0], ref[1], ref[2])
      case 4: return pull(read, ref[0], ref[1], ref[2], ref[3])
      default:
        ref.unshift(read)
        return pull.apply(null, ref)
      }
    }
  }

  var read = a

  if (read && typeof read.source === 'function') {
    read = read.source
  }

  for (var i = 1; i < length; i++) {
    var s = arguments[i]
    if (typeof s === 'function') {
      read = s(read)
    } else if (s && typeof s === 'object') {
      s.sink(read)
      read = s.source
    }
  }

  return read
}

},{}],10:[function(require,module,exports){
'use strict'

var reduce = require('./reduce')

module.exports = function collect (cb) {
  return reduce(function (arr, item) {
    arr.push(item)
    return arr
  }, [], cb)
}

},{"./reduce":17}],11:[function(require,module,exports){
'use strict'

var reduce = require('./reduce')

module.exports = function concat (cb) {
  return reduce(function (a, b) {
    return a + b
  }, '', cb)
}

},{"./reduce":17}],12:[function(require,module,exports){
'use strict'

module.exports = function drain (op, done) {
  var read, abort

  function sink (_read) {
    read = _read
    if(abort) return sink.abort()
    //this function is much simpler to write if you
    //just use recursion, but by using a while loop
    //we do not blow the stack if the stream happens to be sync.
    ;(function next() {
        var loop = true, cbed = false
        while(loop) {
          cbed = false
          read(null, function (end, data) {
            cbed = true
            if(end = end || abort) {
              loop = false
              if(done) done(end === true ? null : end)
              else if(end && end !== true)
                throw end
            }
            else if(op && false === op(data) || abort) {
              loop = false
              read(abort || true, done || function () {})
            }
            else if(!loop){
              next()
            }
          })
          if(!cbed) {
            loop = false
            return
          }
        }
      })()
  }

  sink.abort = function (err, cb) {
    if('function' == typeof err)
      cb = err, err = true
    abort = err || true
    if(read) return read(abort, cb || function () {})
  }

  return sink
}

},{}],13:[function(require,module,exports){
'use strict'

function id (e) { return e }
var prop = require('../util/prop')
var drain = require('./drain')

module.exports = function find (test, cb) {
  var ended = false
  if(!cb)
    cb = test, test = id
  else
    test = prop(test) || id

  return drain(function (data) {
    if(test(data)) {
      ended = true
      cb(null, data)
    return false
    }
  }, function (err) {
    if(ended) return //already called back
    cb(err === true ? null : err, null)
  })
}





},{"../util/prop":37,"./drain":12}],14:[function(require,module,exports){
'use strict'

module.exports = {
  drain: require('./drain'),
  onEnd: require('./on-end'),
  log: require('./log'),
  find: require('./find'),
  reduce: require('./reduce'),
  collect: require('./collect'),
  concat: require('./concat')
}


},{"./collect":10,"./concat":11,"./drain":12,"./find":13,"./log":15,"./on-end":16,"./reduce":17}],15:[function(require,module,exports){
'use strict'

var drain = require('./drain')

module.exports = function log (done) {
  return drain(function (data) {
    console.log(data)
  }, done)
}

},{"./drain":12}],16:[function(require,module,exports){
'use strict'

var drain = require('./drain')

module.exports = function onEnd (done) {
  return drain(null, done)
}

},{"./drain":12}],17:[function(require,module,exports){
'use strict'

var drain = require('./drain')

module.exports = function reduce (reducer, acc, cb ) {
  if(!cb) cb = acc, acc = null
  var sink = drain(function (data) {
    acc = reducer(acc, data)
  }, function (err) {
    cb(err, acc)
  })
  if (arguments.length === 2)
    return function (source) {
      source(null, function (end, data) {
        //if ended immediately, and no initial...
        if(end) return cb(end === true ? null : end)
        acc = data; sink(source)
      })
    }
  else
    return sink
}

},{"./drain":12}],18:[function(require,module,exports){
'use strict'

module.exports = function count (max) {
  var i = 0; max = max || Infinity
  return function (end, cb) {
    if(end) return cb && cb(end)
    if(i > max)
      return cb(true)
    cb(null, i++)
  }
}



},{}],19:[function(require,module,exports){
'use strict'
//a stream that ends immediately.
module.exports = function empty () {
  return function (abort, cb) {
    cb(true)
  }
}

},{}],20:[function(require,module,exports){
'use strict'
//a stream that errors immediately.
module.exports = function error (err) {
  return function (abort, cb) {
    cb(err)
  }
}


},{}],21:[function(require,module,exports){
'use strict'
module.exports = {
  keys: require('./keys'),
  once: require('./once'),
  values: require('./values'),
  count: require('./count'),
  infinite: require('./infinite'),
  empty: require('./empty'),
  error: require('./error')
}

},{"./count":18,"./empty":19,"./error":20,"./infinite":22,"./keys":23,"./once":24,"./values":25}],22:[function(require,module,exports){
'use strict'
module.exports = function infinite (generate) {
  generate = generate || Math.random
  return function (end, cb) {
    if(end) return cb && cb(end)
    return cb(null, generate())
  }
}



},{}],23:[function(require,module,exports){
'use strict'
var values = require('./values')
module.exports = function (object) {
  return values(Object.keys(object))
}



},{"./values":25}],24:[function(require,module,exports){
'use strict'
var abortCb = require('../util/abort-cb')

module.exports = function once (value, onAbort) {
  return function (abort, cb) {
    if(abort)
      return abortCb(cb, abort, onAbort)
    if(value != null) {
      var _value = value; value = null
      cb(null, _value)
    } else
      cb(true)
  }
}



},{"../util/abort-cb":36}],25:[function(require,module,exports){
'use strict'
var abortCb = require('../util/abort-cb')

module.exports = function values (array, onAbort) {
  if(!array)
    return function (abort, cb) {
      if(abort) return abortCb(cb, abort, onAbort)
      return cb(true)
    }
  if(!Array.isArray(array))
    array = Object.keys(array).map(function (k) {
      return array[k]
    })
  var i = 0
  return function (abort, cb) {
    if(abort)
      return abortCb(cb, abort, onAbort)
    if(i >= array.length)
      cb(true)
    else
      cb(null, array[i++])
  }
}

},{"../util/abort-cb":36}],26:[function(require,module,exports){
'use strict'

function id (e) { return e }
var prop = require('../util/prop')

module.exports = function asyncMap (map) {
  if(!map) return id
  map = prop(map)
  var busy = false, abortCb, aborted
  return function (read) {
    return function next (abort, cb) {
      if(aborted) return cb(aborted)
      if(abort) {
        aborted = abort
        if(!busy) read(abort, cb)
        else read(abort, function () {
          //if we are still busy, wait for the mapper to complete.
          if(busy) abortCb = cb
          else cb(abort)
        })
      }
      else
        read(null, function (end, data) {
          if(end) cb(end)
          else if(aborted) cb(aborted)
          else {
            busy = true
            map(data, function (err, data) {
              busy = false
              if(aborted) {
                cb(aborted)
                abortCb(aborted)
              }
              else if(err) next (err, cb)
              else cb(null, data)
            })
          }
        })
    }
  }
}



},{"../util/prop":37}],27:[function(require,module,exports){
'use strict'

var tester = require('../util/tester')
var filter = require('./filter')

module.exports = function filterNot (test) {
  test = tester(test)
  return filter(function (data) { return !test(data) })
}

},{"../util/tester":38,"./filter":28}],28:[function(require,module,exports){
'use strict'

var tester = require('../util/tester')

module.exports = function filter (test) {
  //regexp
  test = tester(test)
  return function (read) {
    return function next (end, cb) {
      var sync, loop = true
      while(loop) {
        loop = false
        sync = true
        read(end, function (end, data) {
          if(!end && !test(data))
            return sync ? loop = true : next(end, cb)
          cb(end, data)
        })
        sync = false
      }
    }
  }
}


},{"../util/tester":38}],29:[function(require,module,exports){
'use strict'

var values = require('../sources/values')
var once = require('../sources/once')

//convert a stream of arrays or streams into just a stream.
module.exports = function flatten () {
  return function (read) {
    var _read
    return function (abort, cb) {
      if (abort) { //abort the current stream, and then stream of streams.
        _read ? _read(abort, function(err) {
          read(err || abort, cb)
        }) : read(abort, cb)
      }
      else if(_read) nextChunk()
      else nextStream()

      function nextChunk () {
        _read(null, function (err, data) {
          if (err === true) nextStream()
          else if (err) {
            read(true, function(abortErr) {
              // TODO: what do we do with the abortErr?
              cb(err)
            })
          }
          else cb(null, data)
        })
      }
      function nextStream () {
        _read = null
        read(null, function (end, stream) {
          if(end)
            return cb(end)
          if(Array.isArray(stream) || stream && 'object' === typeof stream)
            stream = values(stream)
          else if('function' != typeof stream)
            stream = once(stream)
          _read = stream
          nextChunk()
        })
      }
    }
  }
}


},{"../sources/once":24,"../sources/values":25}],30:[function(require,module,exports){
'use strict'

module.exports = {
  map: require('./map'),
  asyncMap: require('./async-map'),
  filter: require('./filter'),
  filterNot: require('./filter-not'),
  through: require('./through'),
  take: require('./take'),
  unique: require('./unique'),
  nonUnique: require('./non-unique'),
  flatten: require('./flatten')
}




},{"./async-map":26,"./filter":28,"./filter-not":27,"./flatten":29,"./map":31,"./non-unique":32,"./take":33,"./through":34,"./unique":35}],31:[function(require,module,exports){
'use strict'

function id (e) { return e }
var prop = require('../util/prop')

module.exports = function map (mapper) {
  if(!mapper) return id
  mapper = prop(mapper)
  return function (read) {
    return function (abort, cb) {
      read(abort, function (end, data) {
        try {
        data = !end ? mapper(data) : null
        } catch (err) {
          return read(err, function () {
            return cb(err)
          })
        }
        cb(end, data)
      })
    }
  }
}

},{"../util/prop":37}],32:[function(require,module,exports){
'use strict'

var unique = require('./unique')

//passes an item through when you see it for the second time.
module.exports = function nonUnique (field) {
  return unique(field, true)
}

},{"./unique":35}],33:[function(require,module,exports){
'use strict'

//read a number of items and then stop.
module.exports = function take (test, opts) {
  opts = opts || {}
  var last = opts.last || false // whether the first item for which !test(item) should still pass
  var ended = false
  if('number' === typeof test) {
    last = true
    var n = test; test = function () {
      return --n
    }
  }

  return function (read) {

    function terminate (cb) {
      read(true, function (err) {
        last = false; cb(err || true)
      })
    }

    return function (end, cb) {
      if(ended)            last ? terminate(cb) : cb(ended)
      else if(ended = end) read(ended, cb)
      else
        read(null, function (end, data) {
          if(ended = ended || end) {
            //last ? terminate(cb) :
            cb(ended)
          }
          else if(!test(data)) {
            ended = true
            last ? cb(null, data) : terminate(cb)
          }
          else
            cb(null, data)
        })
    }
  }
}

},{}],34:[function(require,module,exports){
'use strict'

//a pass through stream that doesn't change the value.
module.exports = function through (op, onEnd) {
  var a = false

  function once (abort) {
    if(a || !onEnd) return
    a = true
    onEnd(abort === true ? null : abort)
  }

  return function (read) {
    return function (end, cb) {
      if(end) once(end)
      return read(end, function (end, data) {
        if(!end) op && op(data)
        else once(end)
        cb(end, data)
      })
    }
  }
}

},{}],35:[function(require,module,exports){
'use strict'

function id (e) { return e }
var prop = require('../util/prop')
var filter = require('./filter')

//drop items you have already seen.
module.exports = function unique (field, invert) {
  field = prop(field) || id
  var seen = {}
  return filter(function (data) {
    var key = field(data)
    if(seen[key]) return !!invert //false, by default
    else seen[key] = true
    return !invert //true by default
  })
}


},{"../util/prop":37,"./filter":28}],36:[function(require,module,exports){
module.exports = function abortCb(cb, abort, onAbort) {
  cb(abort)
  onAbort && onAbort(abort === true ? null: abort)
  return
}


},{}],37:[function(require,module,exports){
module.exports = function prop (key) {
  return key && (
    'string' == typeof key
    ? function (data) { return data[key] }
    : 'object' === typeof key && 'function' === typeof key.exec //regexp
    ? function (data) { var v = key.exec(data); return v && v[0] }
    : key
  )
}

},{}],38:[function(require,module,exports){
var prop = require('./prop')

function id (e) { return e }

module.exports = function tester (test) {
  return (
    'object' === typeof test && 'function' === typeof test.test //regexp
    ? function (data) { return test.test(data) }
    : prop (test) || id
  )
}

},{"./prop":37}],39:[function(require,module,exports){
(function (process){
var pull = require('pull-stream/pull')
var looper = require('looper')

function destroy(stream, cb) {
  function onClose () {
    cleanup(); cb()
  }
  function onError (err) {
    cleanup(); cb(err)
  }
  function cleanup() {
    stream.removeListener('close', onClose)
    stream.removeListener('error', onError)
  }
  stream.on('close', onClose)
  stream.on('error', onError)
}

function destroy (stream) {
  if(!stream.destroy)
    console.error(
      'warning, stream-to-pull-stream: \n'
    + 'the wrapped node-stream does not implement `destroy`, \n'
    + 'this may cause resource leaks.'
    )
  else stream.destroy()

}

function write(read, stream, cb) {
  var ended, closed = false, did
  function done () {
    if(did) return
    did = true
    cb && cb(ended === true ? null : ended)
  }

  function onClose () {
    if(closed) return
    closed = true
    cleanup()
    if(!ended) read(ended = true, done)
    else       done()
  }
  function onError (err) {
    cleanup()
    if(!ended) read(ended = err, done)
  }
  function cleanup() {
    stream.on('finish', onClose)
    stream.removeListener('close', onClose)
    stream.removeListener('error', onError)
  }
  stream.on('close', onClose)
  stream.on('finish', onClose)
  stream.on('error', onError)
  process.nextTick(function () {
    looper(function (next) {
      read(null, function (end, data) {
        ended = ended || end
        //you can't "end" a stdout stream, so this needs to be handled specially.
        if(end === true)
          return stream._isStdio ? done() : stream.end()

        if(ended = ended || end) {
          destroy(stream)
          return done(ended)
        }

        //I noticed a problem streaming to the terminal:
        //sometimes the end got cut off, creating invalid output.
        //it seems that stdout always emits "drain" when it ends.
        //so this seems to work, but i have been unable to reproduce this test
        //automatically, so you need to run ./test/stdout.js a few times and the end is valid json.
        if(stream._isStdio)
          stream.write(data, function () { next() })
        else {
          var pause = stream.write(data)
          if(pause === false)
            stream.once('drain', next)
          else next()
        }
      })
    })
  })
}

function first (emitter, events, handler) {
  function listener (val) {
    events.forEach(function (e) {
      emitter.removeListener(e, listener)
    })
    handler(val)
  }
  events.forEach(function (e) {
    emitter.on(e, listener)
  })
  return emitter
}

function read2(stream) {
  var ended = false, waiting = false
  var _cb

  function read () {
    var data = stream.read()
    if(data !== null && _cb) {
      var cb = _cb; _cb = null
      cb(null, data)
    }
  }

  stream.on('readable', function () {
    waiting = true
    _cb && read()
  })
  .on('end', function () {
    ended = true
    _cb && _cb(ended)
  })
  .on('error', function (err) {
    ended = err
    _cb && _cb(ended)
  })

  return function (end, cb) {
    _cb = cb
    if(ended)
      cb(ended)
    else if(waiting)
      read()
  }
}

function read1(stream) {
  var buffer = [], cbs = [], ended, paused = false

  var draining
  function drain() {
    while((buffer.length || ended) && cbs.length)
      cbs.shift()(buffer.length ? null : ended, buffer.shift())
    if(!buffer.length && (paused)) {
      paused = false
      stream.resume()
    }
  }

  stream.on('data', function (data) {
    buffer.push(data)
    drain()
    if(buffer.length && stream.pause) {
      paused = true
      stream.pause()
    }
  })
  stream.on('end', function () {
    ended = true
    drain()
  })
  stream.on('close', function () {
    ended = true
    drain()
  })
  stream.on('error', function (err) {
    ended = err
    drain()
  })
  return function (abort, cb) {
    if(!cb) throw new Error('*must* provide cb')
    if(abort) {
      function onAbort () {
        while(cbs.length) cbs.shift()(abort)
        cb(abort)
      }
      //if the stream happens to have already ended, then we don't need to abort.
      if(ended) return onAbort()
      stream.once('close', onAbort)
      destroy(stream)
    }
    else {
      cbs.push(cb)
      drain()
    }
  }
}

var read = read1

var sink = function (stream, cb) {
  return function (read) {
    return write(read, stream, cb)
  }
}

var source = function (stream) {
  return read1(stream)
}

exports = module.exports = function (stream, cb) {
  return (
    (stream.writable && stream.write)
    ? stream.readable
      ? function(_read) {
          write(_read, stream, cb);
          return read1(stream)
        }
      : sink(stream, cb)
    : source(stream)
  )
}

exports.sink = sink
exports.source = source
exports.read = read
exports.read1 = read1
exports.read2 = read2
exports.duplex = function (stream, cb) {
  return {
    source: source(stream),
    sink: sink(stream, cb)
  }
}
exports.transform = function (stream) {
  return function (read) {
    var _source = source(stream)
    sink(stream)(read); return _source
  }
}










}).call(this,require('_process'))
},{"_process":4,"looper":3,"pull-stream/pull":9}],40:[function(require,module,exports){
'use strict'
var pull = require('pull-stream/pull')
var params = require('./sources/params') 
var isSource = require('is-pull-stream').isSource
var isDuplex = require('is-pull-stream').isDuplex
var cat = require('pull-cat')

module.exports = function(){
    
    var commands = [];
    
    [].slice.call(arguments).forEach(function(arg){
        if (typeof arg !=="function" && !(arg!=null && isDuplex(arg))) commands.push(params(arg))
        else commands.push(arg)
    });

    var rest = []
    var sources = commands.filter(function(item){
        if(isSource(item ))  return true
        rest.push(item)
        return false
    })

    if(sources.length<=1) return pull.apply(null,commands)
    
    return pull.apply(null,[].concat([cat(sources)],rest))
}
},{"./sources/params":43,"is-pull-stream":2,"pull-cat":5,"pull-stream/pull":9}],41:[function(require,module,exports){
module.exports = {
  params:require('./params'),
  notify:require('./notify'),
  pushable:require('pull-pushable')
}
},{"./notify":42,"./params":43,"pull-pushable":8}],42:[function(require,module,exports){
'use strict'
var Notify = require('pull-notify')
module.exports=function () {
  var notify = Notify.apply(Notify, [].slice.call(arguments))
  var listen = notify.listen

  notify.listen = function () {
      var l = listen.apply(notify, arguments)
      var s = function source() {
      l.apply(null, arguments)
      }

      s.end = l.end
      return s
  }

  notify.end = function (err) {
      notify.abort(err || true)
  }

  return notify
}
},{"pull-notify":6}],43:[function(require,module,exports){
'use strict'
var pull = require('pull-stream/pull')
var values = require('pull-stream/sources/values')
var map = require('pull-stream/throughs/map')
var flatten = require('pull-stream/throughs/flatten');

module.exports = function () {
  return pull(
    values([].slice.call(arguments)),
    map(function (arg) {
      if (!Array.isArray(arg)) return [arg]
      return arg
    }),
    flatten()
    )
  }
},{"pull-stream/pull":9,"pull-stream/sources/values":25,"pull-stream/throughs/flatten":29,"pull-stream/throughs/map":31}],44:[function(require,module,exports){
module.exports = {
  isFunction:require('./isFunction'),
  isPlainObject:require('./isPlainObject'),
  isString:require('./isString'),
  isArray : Array.isArray,
  pair:require('pull-pair'),
  toPull:require('stream-to-pull-stream'),
  cat:require('pull-cat')
}
},{"./isFunction":45,"./isPlainObject":46,"./isString":47,"pull-cat":5,"pull-pair":7,"stream-to-pull-stream":39}],45:[function(require,module,exports){
module.exports = function (f) {
    return 'function' === typeof f
}
},{}],46:[function(require,module,exports){
module.exports=function (o) {
    return o && 'object' === typeof o && !Array.isArray(o)
}

},{}],47:[function(require,module,exports){
module.exports=function (s) {
    return typeof s === 'string'
}

},{}]},{},[1])(1)
});