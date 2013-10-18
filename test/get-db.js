var join = require('path').join;
var tmpdir = require('os').tmpdir;
var rimraf = require('rimraf').sync;
var sub = require('level-sublevel');
var level = require('level');

module.exports = function getDb(fn) {
  var p = join(tmpdir(), Math.random().toString(16));
  rimraf(p);
  var db = sub(level(p));
  var a = db.sublevel('a');
  var b = db.sublevel('b');
  var an = a.sublevel('n');
  db.batch([
    { type: 'put', prefix: a, key: 'aa', value: 'aa' },
    { type: 'put', prefix: a, key: 'ab', value: 'ab' },
    { type: 'put', prefix: an, key: 'ana', value: 'ana' },
    { type: 'put', prefix: b, key: 'ba', value: 'ba' },  
    { type: 'put', prefix: b, key: 'bb', value: 'bb' }  
  ], function(err) {
    if (err) return fn(err);
    db.close(function(err) {
      if (err) return fn(err);
      fn(null, sub(level(p)));
    })
  });
}
