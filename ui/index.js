var _ = require('underscore');
var React = require('react');
var superagent = require('superagent');

var io = require('socket.io-client');

var App = React.createClass({

  getInitialState: function () {
    return {
      running: false,
      messages: {}
    };
  },

  propTypes: {
    vhost: React.PropTypes.object.isRequired
  },

  componentDidMount: function () {
    var self = this;
    var socket = this.socket = io();

    socket.on('log', function () {
      console.log(arguments);
    });

    socket.on('connect', function () {
      socket.emit('containers:list', '', function (err, containers) {
        if (err) {
          return console.error(err);
        };

        console.log(containers);
        self.setState({
          containers: containers
        });
      });
    });

    socket.on('containers:list', function (containers) {
      console.log(containers);
      self.setState({
        containers: containers
      });
    });

    socket.on('status:containers:create', function (data) {
      console.log(data);

      if (data.completed) {
        self.setState({
          messages: {}
        });
      } else {
        var messages = self.state.messages;
        messages[data.id || 'default'] = data;
        self.setState({
          messages: messages
        });        
      }
    });

    socket.on('success:containers:create', function (data) {
      console.log(data);
    });

    this.containerListInterval = setInterval(function () {
      socket.emit('containers:list', '', function (err, containers) {
        if (err) {
          return console.error(err);
        };

        console.log(containers);
        self.setState({
          containers: containers
        });
      });
    }, 10 * 1000);
  },

  componentWillUnmount: function () {
    this.socket.close();
    clearInterval(this.containerListInterval);
  },

  propTypes: {
    data: React.PropTypes.object
  },

  render: function () {
    var self = this;
    var data = this.state.data || this.props.data;

    return (
      <div>
        <h3>Docker Web</h3>

        <br />

        <div className='row'>
          <form onSubmit={this.runContainer}>
            <div className='one-third column'>
              <label htmlFor='imageName'>Pull Image from Docker Hub</label>
              <input type='text' name='imageName' className='u-full-width' id='imageName' placeholder='ubuntu' />
            </div>
            <div className="one-third column">
              <label htmlFor='containerName'>Container Name</label>
              <input type='text' name='containerName' className='u-full-width' id='containerName' placeholder='testbox' />
            </div>
            <div className='one-third column'>
              <label htmlFor="submitButton">&nbsp;</label>
              <input type='submit' className='button-primary' id='submitButton' value={this.state.running ? 'Running...' : 'Run'} disabled={this.state.running} />
            </div>
          </form>
        </div>

        <div className='row'>
          <table className="u-full-width">
            <thead>
              <tr>
                <th>Image Layer</th>
                <th>Status</th>
                <th>ProgressDetail</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {_.map(this.state.messages, function (message) {
                return (
                  <tr key={message.id}>
                    <td>{message.id}</td>
                    <td>{message.status}</td>
                    <td>{message.progressDetail ? JSON.stringify(message.progressDetail, null, 2) : ''}</td>
                    <td><pre>{message.progress}</pre></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <br />
        <br />

        <div className='row'>
          <h4>Running Containers</h4>
          <table className="u-full-width">
            <thead>
              <tr>
                <th>URL</th>
                <th>Image</th>
                <th>Ports</th>
                <th>Uptime</th>
              </tr>
            </thead>
            <tbody>
              {_.map(this.state.containers, function (container) {

                var containerName = container.Names[0].slice(1);

                if (self.props.vhost.configure) {
                  var linkURL = containerName + self.props.vhost.url;
                } else {
                  var leastPort = _.min(container.Ports, function (port) {
                    return port.PrivatePort;
                  });
                  var port = leastPort.PublicPort;
                  var linkURL = self.props.vhost.url + ':' + port;
                }

                return (
                  <tr key={container.Id}>
                    <td><a href={linkURL}>{linkURL}</a></td>
                    <td>{containerName + ' from ' + container.Image}</td>
                    <td>{_.map(container.Ports, function (port) {
                      return port.PrivatePort;
                    }).join(', ')}</td>
                    <td>{container.Status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  },

  runContainer: function (e) {
    e.preventDefault();
    var self = this;
    var socket = this.socket;

    var data = {
      imageName: e.target.imageName.value,
      containerName: e.target.containerName.value
    };

    if (!data.imageName || !data.containerName) {
      return;
    }

    this.setState({
      running: true
    });

    socket.emit('containers:run', data, function (err, ack) {
      if (err) {
        return console.error(err);
      };

      if (ack) {
        self.setState({
          running: false
        });

        console.log('Pulling container...');
      };

    });
  }
});

module.exports = App;