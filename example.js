var level = require('level');
var sub = require('level-sublevel');
var subStream = require('./');
var rimraf = require('rimraf').sync;

rimraf(__dirname + '/db');
var db = sub(level(__dirname + '/db'));

db.batch([
  { type: 'put', prefix: db.sublevel('a'), key: 'aa', value: 'aa' },
  { type: 'put', prefix: db.sublevel('a'), key: 'ab', value: 'ab' },
  { type: 'put', prefix: db.sublevel('b'), key: 'ba', value: 'ba' },  
  { type: 'put', prefix: db.sublevel('b'), key: 'bb', value: 'bb' }  
], function(err) {
  if (err) throw err;
  db.close(function(err) {
    if (err) throw err;
    db = sub(level(__dirname + '/db'));
    subStream(db).on('data', console.log);
  });
});
