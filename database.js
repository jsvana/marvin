var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var config = require('./config');
var logger = require('./logger');

fs.exists(config.database.filename, function (exists) {
	db = new sqlite3.Database(config.database.filename);

	if (!exists) {
		logger.log('Creating database');
		fs.readFile(config.database.createScript, 'utf8', function (err, data) {
			if (err) {
				error('Error reading create script: ' + err);
				process.exit(1);
			}

			db.exec(data, function (err) {
				if (err) {
					error('Error creating table: ' + err);
					process.exit(1);
				}

				logger.log('Database created');
			});
		});
	}
});

var Database = function() {
	var db;

	this.initialize = function() {
		db = new sqlite3.Database(config.database.filename);
	};

	this.select = function(statement, callback, completed) {
		if (db) {
			db.each(statement, function(err, row) {
				callback(err, row);
			});

			if (completed !== undefined) {
				completed();
			}
		}
	};

	this.update = function(statement, params, callback) {
		if (db) {
			db.run(statement, params, callback);
		}
	};

	this.insert = function(statement, params, callback) {
		if (db) {
			db.run(statement, params, callback);
		}
	}
};

module.exports = new Database();
