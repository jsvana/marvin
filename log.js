var colors = require('colors');

var log = function(message) {
	console.log((new Date()).toISOString().cyan + ' [LOG]'.green + ' ' + message);
};

var error = function(message) {
	console.log((new Date()).toISOString().cyan + ' [ERROR]'.red + ' ' + message);
};

module.exports = {
	log: log,
	error: error
};
