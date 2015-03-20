var docker = require('../clients/docker');

function socketHandler (socket) {
  socket.emit('log', "Welcome, client socket " + socket.id);
  socket.on('log', function (data) { console.log(data); });

  socket.on('containers:list', function (data, cb) {
    docker.listContainers(function (err, containers) {
      cb && cb(err, containers);
    });
  });

  socket.on('containers:run', function (data, cb) {
    console.log(data);

    docker.pullImage(data.imageName, function (err, stream) {
      if (err) {
        return cb && cb(err);
      };

      cb(null, true);

      stream.setEncoding('utf8');
      stream.on('data', function (data) {
        socket.emit('status:containers:create', data);
      });
    });

    // docker.listContainers(function (err, containers) {
    //   cb && cb(err, containers);
    // });
  });
};

module.exports = socketHandler;