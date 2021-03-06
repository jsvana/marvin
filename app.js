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
var Type = require('./types');

app.use(express.bodyParser());
app.use('/public', express.static(__dirname + "/public"));

server.listen(config.port);

var serialPort;
var ready = false;

logger.level = 2;

var lights = [];

database.initialize();

var updateLight = function(id, status) {
	database.update('UPDATE lights SET "status"=' + (status ? '1' : '0')
		+ ' WHERE "id"=' + id);
}

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

		/*
		database.select("SELECT * FROM lights;", function(err, row) {
			row = row[0];
			row.status = row.status === 1;
			lights[row.index] = row;
		});
		*/

		serialPort.on('data', function(data) {
			data = data.replace(/(\n|\r)+$/, '');
			logger.debug('Received: ' + data);

			try {
				var json = JSON.parse(data);

				if (json.c === Type.command.retrieve && json.t === Type.type.analog
					&& json.n === 0) {
					database.insert('INSERT INTO temperatures ("value", "timestamp") VALUES ('
						+ json.d + ', DATETIME(\'now\'));');
				}
			} catch (e) {

			}

			io.sockets.emit('data', data);

			/*if (data.charAt(1) === 'r') {
				if (data.charAt(2) === 'l') {
					lights[parseInt(data.charAt(3), 10)].status = data.charAt(4) === '+';
				}
			} else {
				io.sockets.emit('update', { light: lights[parseInt(data.charAt(1), 10)] });
			}*/
		});

		logger.log('Server started, listening on ' + config.port);
	});
});

if (config.pollRate > 0) {
	setInterval(function() {
		serialPort.write('{"c":' + Type.command.retrieve + ',"t":'
			+ Type.type.analog + ',"n":0}\n');
	}, config.pollRate);
}

app.get('/login', function(req, res) {

});

app.get('/temperatures/mostrecent', function(req, res) {
	database.select('SELECT * FROM temperatures ORDER BY "timestamp" DESC LIMIT 1;',
		function(err, rows) {
		res.send(JSON.stringify(rows[0]));
	});
});

app.get('/temperatures', function(req, res) {
	database.select('SELECT * FROM temperatures ORDER BY "timestamp";',
		function(err, rows) {
		res.send(JSON.stringify(rows));
	});
});

app.get('/lights/:id/on', function(req, res) {
	logger.log(req.params);
});

app.get('/lights/:id/off', function(req, res) {
	logger.log(req.params);
});

app.get('/lights/:id/toggle', function(req, res) {
	logger.log(req.params);
});

app.get('/lights/:id', function(req, res) {

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

				if (data.type === 'light') {
					lights[data.index].status = lights[data.index].status ? false : true;
					updateLight(lights[data.index].id, lights[data.index].status);
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

	socket.on('asdf', function(data) {
		serialPort.write(data.content + "\n");
		logger.debug('Sent: ' + data.content);
	});
});
