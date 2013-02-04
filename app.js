var SerialPort = require("serialport");
var exec = require('child_process').exec;
var fs = require('fs');
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var options = { 'log level': 0 };
var io = require('socket.io').listen(server, options);

var database = require('./database');
var config = require('./config');
var logger = require('./logger');

app.use(express.bodyParser());
app.use('/public', express.static(__dirname + "/public"));

server.listen(config.port);

var serialPort;
var ready = false;

logger.level = 2;

var lights = [];

database.initialize();

SerialPort.list(function(err, ports) {
	if (ports.length === 0) {
		logger.error('No Arduino detected.');
		process.exit(1);
	}

	var device = ports[0].comName;

	serialPort = new SerialPort.SerialPort(device, {
		baudrate: 9600,
		parser: SerialPort.parsers.readline("\n")
	});

	ready = false;

	serialPort.on('open', function () {
		logger.log('Connected to Arduino on ' + device);

		ready = true;

		database.select("SELECT * FROM lights;", function(err, row) {
			row.status = row.status === 1;
			lights[row.index] = row;
		});

		serialPort.on('data', function(data) {
			data = data.replace(/(\n|\r)+$/, '');
			logger.debug('Received: ' + data);

			if (data.charAt(1) === 'r') {
				if (data.charAt(2) === 'l') {
					lights[parseInt(data.charAt(3), 10)].status = data.charAt(4) === '+';
				}
			} else {
				io.sockets.emit('update', { light: lights[parseInt(data.charAt(1), 10)] });
			}
		});

		logger.log('Server started, listening on ' + config.port);
	});
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
	socket.set('loggedIn', false);

	socket.on('login', function(data) {
		if (data.username === 'test' && data.password === 'hunter2') {
			socket.set('loggedIn', true);

			logger.log('User ' + data.username + ' logged in');

			socket.emit('setup', { lights: lights });
		}
	});

	socket.on('toggle', function(data) {
		socket.get('loggedIn', function(err, loggedIn) {
			if (ready && loggedIn) {
				var msg;

				if (data.type === 'l') {
					lights[data.index].status = lights[data.index].status ? false : true;
					database.update('UPDATE lights SET "status"='
						+ (lights[data.index].status ? '1' : '0') + ' WHERE "id"='
						+ lights[data.index].id);
					msg = 'Toggle light ' + data.index + ' '
						+ (lights[data.index].status ? 'on' : 'off');
				}

				logger.debug(msg);
				serialPort.write('s' + data.type + data.index);
				logger.debug('Sent: s' + data.type + data.index);
			} else {
				logger.error('Not logged in');
			}
		});
  });
});
