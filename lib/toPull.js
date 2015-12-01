var _ = require('./icebreaker')
var stream = require('stream')
var to = require('stream-to-pull-stream')

_.mixin({
  toPull: to,
})
