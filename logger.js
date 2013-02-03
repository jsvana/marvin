var colors = require('colors');

var Logger = function(level) {
	this.level = level;

	this.log = function(message) {
		if (this.level >= 1) {
			console.log((new Date()).toISOString().cyan + ' [LOG]'.green + ' ' + message);
		}
	};

	this.error =  function(message) {
		console.log((new Date()).toISOString().cyan + ' [ERROR]'.red + ' ' + message);
	};

	this.debug = function(message) {
		if (this.level >= 2) {
			console.log((new Date()).toISOString().cyan + ' [DEBUG]'.blue + ' ' + message);
		}
	};
}

module.exports = new Logger();
