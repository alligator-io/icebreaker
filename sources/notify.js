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