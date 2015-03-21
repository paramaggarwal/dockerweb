var config = require('config');
var vhosts = require('nginx-vhosts')(config.get('nginx'));

function link (name, vhost, port, cb) {
  vhosts.write({
    name: name,
    port: port,
    domain: vhost
  }, function(err, stdout, stderr) {
    if (err) {
      return cb(err);
    };

    cb(null, stdout);
  });
};

module.exports = {
  link: link
};