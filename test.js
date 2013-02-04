var SerialPort = require("serialport");
var serialPort;

SerialPort.list(function (err, ports) {
	if (ports.length == 0) {
		console.log('no ports');
		process.exit(1);
	}

	serialPort = new SerialPort.SerialPort(ports[0].comName, {
		baudrate: 9600,
		parser: SerialPort.parsers.readline("\n")
	});

	serialPort.on('open', function() {
		console.log('connected');

		serialPort.write("{\"test\":\"asdf\"}\n");

		serialPort.on('data', function(data) {
			console.log('received: ' + data);
		});
	});
});
