var subStream = require('..');
var test = require('tape');
var getDb = require('./get-db');

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

