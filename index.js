var through = require('through');

module.exports = function(db, opts) {
  var tr = through();
  if (!opts) opts = {};
  var sep = opts.sep || '\xff';

  if (opts.gt) opts.gt = sep + opts.gt + sep + sep;
  else if (opts.gte) opts.gte = sep + opts.gte;
  else opts.gt = sep;

  if (opts.lt) opts.lt = sep + opts.lt;
  else if (opts.lte) opts.lte = sep + opts.lte + sep + sep;
  else opts.lt = sep + sep;

  opts.limit = 1;

  (function next() {
    var found = false;

    db.createKeyStream(opts)
    .on('error', function(err) {
      tr.emit('error', err);
    })
    .on('data', function(key) {
      found = true;
      var sub = key.split('\xff')[1];
      tr.queue(sub);

      if (opts.reverse) {
        opts.lt = sep + sub;
        opts.lte = null;
      } else {
        opts.gt = sep + sub + sep + sep;
        opts.gte = null;
      }

      next();
    })
    .on('end', function() {
      if (!found) tr.queue(null);
    });
  })();

  return tr;
};

