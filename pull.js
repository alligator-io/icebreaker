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