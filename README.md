icebreaker
============
[pull-stream](https://github.com/dominictarr/pull-stream) based library for node.js and the browser.

[![Sauce Test Status](https://saucelabs.com/browser-matrix/alligator-io.svg)](https://saucelabs.com/u/alligator-io)

[![Travis](https://img.shields.io/travis/alligator-io/icebreaker.svg)](https://travis-ci.org/alligator-io/icebreaker)
[![NPM](https://img.shields.io/npm/dm/icebreaker.svg)](https://www.npmjs.com/package/icebreaker)
## NPM
```bash
npm install --save icebreaker
```
## Bower
```bash
bower install icebreaker.js --save
```
## Usage
### In Node.js
```javascript
var _ = require('icebreaker')
_(
  [1,2,3,4,5,'hello','world'],
  _.drain(function(i){
      console.log(i)
    },
    function(err){
      console.log('done')
    })
  )
```

### In the Browser
```html
<html>
<head>
  <script src="bower_components/icebreaker.js/dist/icebreaker.js"></script>
</head>
<body>
  <script>
    var _ = icebreaker
    _(
      [1,2,3,4,5,'hello','world'],
      _.drain(function(i){
        console.log(i)
      },
      function(err){
        console.log('done')
      })
    )
  </script>
  </body>
</html>
```
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
For more examples, check the test/ folder.


## License
MIT
