var vhosts = require('nginx-vhosts')({
  confDir: '/usr/local/etc/nginx/conf.d/',
  pidLocation: "/usr/local/var/run/nginx.pid"
});

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