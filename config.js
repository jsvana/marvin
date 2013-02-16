var config = {
	port: 8080,

	database: {
		createScript: 'create.sql',
		filename: 'marvin.sqlite'
	},

	pollRate: 30 * 1000
};

module.exports = config;
