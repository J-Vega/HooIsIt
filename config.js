'use strict';

exports.DATABASE_URL = 
	process.env.DATABASE_URL || 'mongodb://user:abc123@ds153851.mlab.com:53851/teletale';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-teletale';
exports.PORT = process.env.PORT || 8080;