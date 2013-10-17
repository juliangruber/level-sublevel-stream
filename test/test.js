var level = require('level');
var sub = require('level-sublevel');
var subStream = require('..');
var rimraf = require('rimraf').sync;
var test = require('tape');
var tmpdir = require('os').tmpdir;
var join = require('path').join;

function getDb(fn) {
  var p = join(tmpdir(), Math.random().toString(16));
  rimraf(p);
  var db = sub(level(p));
  db.batch([
    { type: 'put', prefix: db.sublevel('a'), key: 'aa', value: 'aa' },
    { type: 'put', prefix: db.sublevel('a'), key: 'ab', value: 'ab' },
    { type: 'put', prefix: db.sublevel('b'), key: 'ba', value: 'ba' },  
    { type: 'put', prefix: db.sublevel('b'), key: 'bb', value: 'bb' }  
  ], function(err) {
    if (err) return fn(err);
    db.close(function(err) {
      if (err) return fn(err);
      fn(null, sub(level(p)));
    })
  });
}

var tests = [
  [{ start: 'c' }, []],
  [{ start: 'b' }, ['b']],
  [{ start: 'a' }, ['a', 'b']],

  [{ end: '\x00' }, []],
  /*[{ end: 'a' }, ['a']],*/
  /*[{ end: 'b' }, ['a', 'b']],*/

  /*[{ reverse: true, start: 'c' }, []],*/
  /*[{ reverse: true, start: 'b' }, ['b']],*/
  [{ reverse: true, start: 'a' }, ['b', 'a']],

  /*[{ reverse: true, end: '\x00' }, []],*/
  /*[{ reverse: true, end: 'a' }, ['a']],*/
  [{ reverse: true, end: 'b' }, ['b', 'a']],
];

tests.forEach(function(arr) {
  var name = Object.keys(arr[0]).map(function(k) {
    return k + ':"' + arr[0][k] + '"';
  }).join('-');
  test(name, function(t) {
    t.plan(2);
    getDb(function(err, db) {
      t.error(err);
      var keys = [];
      subStream(db, arr[0])
      .on('data', function(key) { keys.push(key) })
      .on('end', function() {
        t.deepEqual(keys, arr[1]);
      });
    });
  });
});

