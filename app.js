var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var _ = require('underscore');
var docker = require('dockerode')();
var vhosts = require('nginx-vhosts')({
  confDir: '/usr/local/etc/nginx/conf.d/',
  pidLocation: "/usr/local/var/run/nginx.pid"
});

app.get('/', function(req, res){
  docker.listContainers(function (err, containers) {
    if (err) {
      return res.status(500).send(err);
    };

    res.json(containers);
  });
});

app.get('/image/:name', function (req, res) {
  var name = req.params.name;

  docker.getImage()

});

app.get('/new/:name', function (req, res) {

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

// app.use('/', routes);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
