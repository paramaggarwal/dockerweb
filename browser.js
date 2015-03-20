var React = require('react');

var App = require('./ui');
var props = window.APP_PROPS;

React.render(<App {...props} />, document.getElementById('react'));