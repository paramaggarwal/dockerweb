var _ = require('underscore');
var docker = require('../clients/docker');
var nginx = require('../clients/nginx');
var config = require('config');

function socketHandler (socket) {
  socket.emit('log', "Welcome, client socket " + socket.id);
  socket.on('log', function (data) { console.log(data); });

  socket.on('containers:list', function (data, cb) {
    docker.listContainers(function (err, containers) {
      cb && cb(err, containers);
    });
  });

  socket.on('containers:run', function (data, cb) {

    var imageName = data.imageName;
    var containerName = data.containerName;

    docker.pullImage(imageName, function (err, stream) {
      if (err) {
        return cb && cb(err);
      };

      cb(null, true);
      stream.setEncoding('utf8');

      stream.on('data', function (data) {
        socket.emit('status:containers:create', JSON.parse(data));
      });

      stream.on('end', function (data) {
        socket.emit('status:containers:create', {
          completed: true
        });

        docker.runImage(imageName, containerName, function (err, data) {
          if (err) {
            return console.error(err);
          }

          docker.listContainers(function (err, containers) {
            if (err) {
              return console.error(err);
            }

            var newContainer = _.find(containers, function (container) {
              return container.Id = data.id
            });

            var leastPort = _.min(newContainer.Ports, function (port) {
              return port.PrivatePort;
            });

            var port = leastPort.PublicPort;

            if (config.get('vhost.configure')) {
              var suffixurl = config.get('vhost.url');
              nginx.link(containerName, containerName + suffixurl, port, function () {
                console.log(arguments);
              });              
            };

            socket.emit('containers:list', containers);
          });

          socket.emit('success:containers:create', data);
        });
      });
    });

    // docker.listContainers(function (err, containers) {
    //   cb && cb(err, containers);
    // });
  });
};

module.exports = socketHandler;