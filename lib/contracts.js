
exports.environment = require('./schema');
exports.filters = require('./filters');

exports.validate = exports.environment.validate.bind(exports.environment);
