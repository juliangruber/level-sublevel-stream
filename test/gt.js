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
  [{ gt: 'b' }, []],
  [{ gt: 'a' }, ['b']],
  [{ gt: '\x00' }, ['a', 'b']],

  [{ reverse: true, gt: 'b' }, []],
  [{ reverse: true, gt: 'a' }, ['b']],
  [{ reverse: true, gt: '\x00' }, ['b', 'a']]
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

