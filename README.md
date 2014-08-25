icebreaker
============
[pull-stream](https://github.com/dominictarr/pull-stream) based library for Node.js.

## Examples

```javascript
var _ = require('icebreaker')

// WITHOUT METHOD CHAINING
_([ 1, 2, 3 ],
_.map(function(m) { return m * 10 }),
_.collect(function(err, data) {
  console.log(err,data)
}))
```
```javascript
var _ = require('icebreaker')
// WITH METHOD CHAINING
_(_.chain([ 1, 2, 3 ])
.map(function(m) { return m * 10 })
.collect(function(err, data) {
  console.log(err,data)
}))

```
### Mixin
### pull-cat
```javascript
_.mixin({
  cat : require('pull-cat')
})

// no chaining
_(
  _.cat([
    _.values([1,2,3,4]),
    _.values([1,2,3,4])
  ]),
  _.collect(function(err,data){
    console.log(data)
  })
)

// chaining
_(
  _.chain()
  .cat([
    _.values([1,2,3,4]),
    _.values([1,2,3,4])
  ])
  .collect(function(err,data){
    console.log(data)
  })
)
```

#### FS Read/Write stream
```javascript
var fs = require('fs')

_.mixin({
  fs : {
    read:function(path){
      return _.source(fs.createReadStream(path) )
    },
    write : function(path,callback){
      return _.sink( fs.createWriteStream(path),callback)
    }
  }
})

// write file

// no chaining
_(
  ['_test1','_test2','_test3'],
  _.fs.write('./test1.txt',
    function(err){
     console.log(err)
    }
  )
)

// chaining
_(
  _.chain(['test1','test2','test3'])
  .fs().write('./test2.txt',
    function(err){
     console.log(err)
    }
  )
)

// read file

// no chaining
_(
  _.fs.read('./test1.txt'),
  _.collect(function(err,data){
    console.log(err,data.toString())
  })
)

// chaining
_(
  _.chain()
  .fs()
  .read('./test2.txt')
  .collect(function(err,data){
    console.log(err,data.toString())
  })
)
```


## License
MIT