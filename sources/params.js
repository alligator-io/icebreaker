'use strict'
var pull = require('pull-stream/pull')
var values = require('pull-stream/sources/values')
var map = require('pull-stream/throughs/map')
var flatten = require('pull-stream/throughs/flatten');

module.exports = function () {
  return pull(
    values(arguments),
    map(function (arg) {
      if (!Array.isArray(arg)) return [arg]
      return arg
    }),
    flatten()
    )
  }