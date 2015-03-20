var express = require('express');
var router = express.Router();

var client = require('../clients/docker');

router.get('/containers', function(req, res) {
  client.listContainers(function (err, containers) {
    if (err) {
      return res.status(500).send(err);
    };

    res.json(containers);
  });
});

router.get('/images', function(req, res){
  client.listImages(function (err, containers) {
    if (err) {
      return res.status(500).send(err);
    };

    res.json(containers);
  });
});

router.get('/images/:name', function (req, res) {
  var name = req.params.name;

  client.imageInfo(name, function (err, data) {
    if (err) {
      return res.status(500).send(err);
    };

    res.json(data);
  });
});

router.get('/images/create/:name', function (req, res) {
  var name = req.params.name;

  client.pullImage(name, function (err, stream) {
    if (err) {
      return res.status(500).send(err);
    };

    res.type('json');
    stream.pipe(res);
  });
});

router.get('/container/:name', function (req, res) {

  client.runImage('nginx', name, function (err, data) {
    if (err) {
      return res.status(500).send(err);
    };

    res.json(data);
  });
});

module.exports = router;
