var through = require('through');

module.exports = function(db, opts) {
  var tr = through();
  if (!opts) opts = {};

  (function next(gt, lt) {
    var found = false;

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
      found = true;
      var sub = key.split('\xff')[1];
      tr.queue(sub);

      if (opts.reverse) {
        next(gt, '\xff' + sub);
      } else {
        next('\xff' + sub + '\xff\xff', lt);
      }
    })
    .on('end', function() {
      if (!found) tr.queue(null);
    });
  })(opts.gt || '\xff', opts.lt || '\xff\xff');

  return tr;
};

