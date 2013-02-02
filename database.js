var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var log = require('./log').log;
var error = require('./log').error;

fs.exists('marvin.sqlite', function (exists) {
	db = new sqlite3.Database('marvin.sqlite');

	if (!exists) {
		log('Creating database');
		fs.readFile('create.sql', 'utf8', function (err, data) {
			if (err) {
				error('Error reading create script: ' + err);
				process.exit(1);
			}

			db.exec(data, function (err) {
				if (err) {
					error('Error creating table: ' + err);
					process.exit(1);
				}

				log('Database created');
			});
		});
	}
});

var Database = function() {
	var db;

	this.initialize = function() {
		db = new sqlite3.Database('marvin.sqlite');
	};

	this.select = function(statement, callback) {
		if (db) {
			db.each(statement, function(err, row) {
				callback(err, row);
			});
		}
	};

	this.update = function(statement, callback) {
		if (db) {
			db.run(statement);
		}
	};
};

module.exports = new Database();
