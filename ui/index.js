var _ = require('underscore');
var React = require('react');
var superagent = require('superagent');

var io = require('socket.io-client');

var App = React.createClass({

  getInitialState: function () {
    return {
      running: false
    };
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

    socket.on('status:containers:create', function (data) {
      console.log(data);
    });
  },

  componentWillUnmount: function () {
    this.socket.close();
  },

  propTypes: {
    data: React.PropTypes.object
  },

  render: function () {
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
              <input type='submit' className='button-primary' id='submitButton' value={this.state.running ? '...' : 'Run'} disabled={this.state.running} />
            </div>
          </form>
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
              <tr>
                <td><a href='http://ubuntu1.param.xyz'>{"http://ubuntu1.param.xyz"}</a></td>
                <td>ubuntu</td>
                <td></td>
                <td>2 hours</td>
              </tr>
              <tr>
                <td><a href='http://es-test.param.xyz'>{"http://es-test.param.xyz"}</a></td>
                <td>elasticsearch</td>
                <td>9200, 9300</td>
                <td>23 minutes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  },

  runContainer: function (e) {
    e.preventDefault();
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
        this.setState({
          running: false
        });

        console.log('Pulling container...');
      };

    });
  }
});

module.exports = App;