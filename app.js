var SerialPort = require("serialport");
var exec = require('child_process').exec;
var fs = require('fs');
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var log = require('./log').log;
var error = require('./log').error;

app.use(express.bodyParser());
app.use('/public', express.static(__dirname + "/public"));

server.listen(8080);

var serialPort;
var ready = false;

io.set('log level', 1);

var lights = [];

exec('ls /dev | grep --colour=never tty.usb', function (error, stdout, stderr) {
	if (stdout === '') {
		err('No USB device detected.');
		process.exit(1);
	}

	var device = stdout.replace(/(\n|\r)+$/, '');

	for (var i = 0; i < 10; i++) {
		lights.push(false);
	}

	serialPort = new SerialPort.SerialPort('/dev/' + device, {
		baudrate: 9600,
		parser: SerialPort.parsers.readline("\n")
	});

	ready = false;

	serialPort.on('open', function () {
		log('Connected to Arduino on /dev/' + device);



		ready = true;
		serialPort.on('data', function(data) {
			data = data.replace(/(\n|\r)+$/, '');
			log('Received: ' + data);

			if (data.charAt(1) === 'r') {
				if (data.charAt(2) === 'l') {
					lights[parseInt(data.charAt(3), 10)] = data.charAt(4) === '+';
					log('Set light');
				}
			}
			io.sockets.emit('update', { data: data });
		});
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
		}
	});

	socket.on('toggle', function(data) {
		socket.get('loggedIn', function(err, loggedIn) {
			if (ready && loggedIn) {
				var msg;

				if (data.type === 'l') {
					lights[data.number] = lights[data.number] ? false : true;
					msg = 'Toggle light ' + data.number + ' '
						+ (lights[data.number] ? 'on' : 'off');
				}

				log(msg);
				serialPort.write(data.type + data.number);
				log('Sent: ' + data.type + data.number);
			} else {
				error('Not logged in');
			}
		});
  });
});
