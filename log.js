var colors = require('colors');

module.exports = {
	log: function(message) {
		console.log((new Date()).toISOString().cyan + ' [LOG]'.green + ' ' + message);
	},

	error: function(message) {
		console.log((new Date()).toISOString().cyan + ' [ERROR]'.red + ' ' + message);
	},

	debug: function(message) {
		console.log((new Date()).toISOString().cyan + ' [DEBUG]'.blue + ' ' + message);
	}
};
