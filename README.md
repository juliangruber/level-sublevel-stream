# level-sublevel-stream

Find all the sublevels of a given database, not requiring them to be in memory
already.

[![build status](https://secure.travis-ci.org/juliangruber/level-sublevel-stream.png)](http://travis-ci.org/juliangruber/level-sublevel-stream)

## Motivation

Most modules currently inspect `db.sublevels` to find out all the sublevels of
a db, but this approach only works when the sublevel has been used since the
app started up, otherwise there's no in memory representation of the sublevel,
it's only in the db.

This module efficiently queries the db to find all the sublevels.

## Example

Insert some data into different sublevels, then close and reopen the db, and
finally use `level-sublevel-stream` to find all the sublevels.

```js
var level = require('level');
var sub = require('level-sublevel');
var subStream = require('level-sublevel-stream');

var db = sub(level(__dirname + '/db'));

db.batch([
  { type: 'put', prefix: db.sublevel('a'), key: 'aa', value: 'aa' },
  { type: 'put', prefix: db.sublevel('a'), key: 'ab', value: 'ab' },
  { type: 'put', prefix: db.sublevel('b'), key: 'ba', value: 'ba' },  
  { type: 'put', prefix: db.sublevel('b'), key: 'bb', value: 'bb' }  
], function(err) {
  db.close(function(err) {
    db = sub(level(__dirname + '/db'));
    subStream(db).on('data', console.log);
  });
});
```

```bash
$ node example.js
a
b
```

## API

### subStream(db[, opts])

Create a readable stream from all sublevels in `db`. `db` can be an
instance of levelup or a sublevel itself.

Possible options are:

* `reverse`: If true, emit sublevels in reverse lexicographic order
* `gt`: Only emit sublevels whose name sort `>` that value
* `gte`: Only emit sublevels whose name sort `>=` that value
* `lt`: Only emit sublevels whose name sort `<` that value
* `lte`: Only emit sublevels whose name sort `<=` that value

## Installation

With [npm](https://npmjs.org) do:

```bash
npm install level-sublevel-stream
```

## License

(MIT)

Copyright (c) 2013 Julian Gruber &lt;julian@juliangruber.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
