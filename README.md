icebreaker
============
[pull-stream](https://github.com/dominictarr/pull-stream) based library for Node.js.

## Example
```javascript
var _ = require('icebreaker')

// WITHOUT METHOD CHAINING
_([ 1, 2, 3 ],
_.map(function(m) { return m * 10 }),
_.collect(function(err, data) {
  console.log(err,data)
}))

// WITH METHOD CHAINING
_(_.chain([ 1, 2, 3 ])
.map(function(m) { return m * 10 })
.collect(function(err, data) {
  console.log(err,data)
}))

```

## License

MIT