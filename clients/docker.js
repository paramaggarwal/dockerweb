var _ = require('underscore');
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

      cb(null, container);
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