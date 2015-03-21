var express = require('express');
var router = express.Router();

var React = require('react');
var config = require('config');
var App = require('../ui');

/* GET home page. */
router.get('/', function(req, res, next) {
  var props = {
    vhost: config.get('vhost')
  };

  res.render('index', {
    title: 'Docker Web',
    page: React.renderToString(<App {...props} />),
    props: props
  });
});


module.exports = router;
