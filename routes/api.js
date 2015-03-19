var express = require('express');
var router = express.Router();

var _ = require('underscore');
var docker = require('dockerode')();
var vhosts = require('nginx-vhosts')({
  confDir: '/usr/local/etc/nginx/conf.d/',
  pidLocation: "/usr/local/var/run/nginx.pid"
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/containers', function(req, res){
  docker.listContainers(function (err, containers) {
    if (err) {
      return res.status(500).send(err);
    };

    res.json(containers);
  });
});

router.get('/images', function(req, res){
  docker.listImages(function (err, containers) {
    if (err) {
      return res.status(500).send(err);
    };

    res.json(containers);
  });
});

router.get('/image/:name', function (req, res) {
  var name = req.params.name;
  var image = docker.getImage(name);

  image.inspect(function (err, data) {
    if (err) {
      return res.status(500).send(err);
    };

    res.json(data);
  });
});

router.post('/container/:name', function (req, res) {

  //
  // assume image is there till there neat way to track a pull is implemented
  //
  //
  // docker.pull('ubuntu', function(err, stream) {
  //   stream.setEncoding('utf8');

  //   stream.on('data', function () {
  //     console.log(arguments);
  //   })
  // });

  var name = req.params.name;

  docker.createContainer({
    Image: 'nginx',
    name: name,
    HostConfig: {
      PublishAllPorts: true
    }
  }, function(err, container) {
    if (err) {
      return res.status(500).send(err);
    };

    container.start({}, function(err, data) {
      if (err) {
        res.status(500).send(err);
      };

      container.inspect(function (err, data) {
        if (err) {
          res.status(500).send(err);
        };

        console.log(data.NetworkSettings.Ports);

        var id = data.Id;
        var containerName = data.Name.slice(1);
        var cmd = data.Config.Cmd;
        var env = data.Config.Env;
        var volumes = data.Config.Volumes;

        var ports = _.map(data.NetworkSettings.Ports, function (val, key) {
          // return key.split('/')[0];
          return +val[0].HostPort;
        });

        vhosts.write({
          name: containerName,
          port: ports[1],
          domain: name + '.local'
        }, function(err, stdout, stderr) {
          console.log(arguments);
  
          res.send({
            name: name,
            container: container.id,
            cmd: cmd,
            env: env,
            volumes: volumes,
            ports: ports
          });
        });
      });
    });
  });
});

module.exports = router;
