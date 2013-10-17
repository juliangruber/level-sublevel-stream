var through = require('through');

module.exports = function(db, opts) {
  var tr = through();
  if (!opts) opts = {};

  (function next(gt, lt) {
    gt = gt || '\xff';
    lt = lt || '\xff\xff';

    db.createKeyStream({
      gt: gt,
      lt: lt,
      reverse: opts.reverse,
      limit: 1
    })
    .on('error', function(err) {
      tr.emit('error', err);
    })
    .on('data', function(key) {
      var sub = key.split('\xff')[1];
      tr.queue(sub);

      if (opts.reverse) {
        next(null, '\xff' + sub);
      } else {
        next('\xff' + sub + '\xff\xff', null);
      }
    });
  })(opts.gt, opts.lt);

  return tr;
};

