/*!
 * Contracts
 * Copyright(c) 2011 Eirikur Nilsson <eirikur@nilsson.is>
 * MIT Licensed
 */

/**
 * Library version.
 */

exports.version = '0.4.0';

/**
 * Dependencies
 */
var url = require('url');

/**
 * The modified JSV environment that we run in.
 */

var environment = exports.environment = require('./schema');

/**
 * Export the supplied filters that can be chained
 * on schemas.
 */

exports.filters = require('./filters');

/**
 * Export the supplied format validators so they can be appended to.
 */

exports.formats = require('./formats');

/**
 * Pre-defines and returns schema. If it has an id, it can be referenced
 * in other schemas with that id.
 */

exports.schema = function(schema) {
  return environment.createSchema(schema);
}

/**
 * Validates the given instance with the given schema.
 */

var validate = exports.validate = function(instance, schema) {
  var report = environment.validate(instance, schema)
  report.instance = report.instance.getValue();
  return report;
};

/**
 * Transforms the given instance using filters in the given schema.
 */

var transform = exports.transform = function(value, schema) {
  var report = validate(value, schema);
  if (report.errors.length > 0) {
    throw new ValidationError(report, "Validation failed");
  }
  return report.instance;
};

/**
 * Wrap a function so invocations get validated to the specified schema.
 */

exports.wrap = function(schema, func) {
  schema = exports.schema(schema);
  return function() {
    var newArgs = transform(Array.prototype.slice.call(arguments), schema);
    func.apply(this, newArgs);
  };
};

/**
 * Create a view middleware that validates params to the specified schema.
 */

exports.view = function(schema) {
  schema = exports.schema(schema);
  return function(req, res, next) {
    var report = validate(req.body, schema);
    if (report.errors.length > 0) {
      return next(new ValidationError(report, "Illegal form data"));
    }
    req.data = report.instance;
    next();
  };
};

/**
 * An error class for ValidationErrors
 */

var ValidationError = exports.ValidationError = function ValidationError(report, message) {
  Error.call(this, message);
  Error.captureStackTrace(this, arguments.callee);

  this.instance = report.instance;
  this.errors = report.errors;
};

ValidationError.prototype = new Error;
ValidationError.prototype.constructor = ValidationError;
ValidationError.prototype.name = "ValidationError";
ValidationError.prototype.toString = function () {
  return this.name + ':\n\n' + this.errors.map(function (err) {
    var property = url.parse(err.uri).hash.replace(/^#\//, "");
    return property + ": " + err.message
  }).join('\n');
};
