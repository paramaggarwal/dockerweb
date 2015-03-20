var express = require('express');
var router = express.Router();

var React = require('react');
var App = require('../ui');

/* GET home page. */
router.get('/', function(req, res, next) {
  var props = {};

  res.render('index', {
    title: 'Docker Web',
    page: React.renderToString(<App {...props} />),
    props: props
  });
});


module.exports = router;
