var docker = require('dockerode')();

function listContainers (cb) {
  docker.listContainers(function (err, containers) {
    if (err) {
      return cb(err);
    };

    cb(null, containers);
  });
};

function listImages (cb) {
  docker.listImages(function (err, images) {
    if (err) {
      return cb(err);
    };

    cb(null, images);
  });
};

function runImage (image, name, cb) {

  docker.createContainer({
    Image: image,
    name: name,
    HostConfig: {
      PublishAllPorts: true
    }
  }, function(err, container) {
    if (err) {
      return cb(err);
    };

    container.start({}, function(err, data) {
      if (err) {
        return cb(err);
      };

      container.inspect(function (err, data) {
        if (err) {
          return cb(err);
        };

        var id = data.Id;
        var containerName = data.Name.slice(1);
        var cmd = data.Config.Cmd;
        var env = data.Config.Env;
        var volumes = data.Config.Volumes;

        var ports = _.map(data.NetworkSettings.Ports, function (val, key) {
          // return key.split('/')[0];
          return +val[0].HostPort;
        });

        cb(null, {
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
};

function imageInfo (name, cb) {
  var image = docker.getImage(name);

  image.inspect(function (err, data) {
    if (err) {
      return cb(err);
    };

    cb(data);
  });
};

function pullImage (name, cb) {
  docker.createImage({
    fromImage: name
  }, function (err, stream) {
    if (err) {
      return cb(err);
    };

    cb(null, stream);
  });
};

module.exports = {
  listContainers: listContainers,
  listImages: listImages,
  imageInfo: imageInfo,
  runImage: runImage,
  pullImage: pullImage
};