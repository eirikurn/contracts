
var formatValidators = module.exports = {};

/**
 * Defines new formats.
 */
formatValidators.add = function(name, format) {
  var formats = name;

  if ('string' == typeof formats) {
    formats = {};
    formats[name] = format;
  }

  for (var key in formats) {
    formatValidators[key] = (function(formatValidator) {
      return function(instance, report) {
        return formatValidator(instance.getValue());
      };
    })(formats[key]);
  }
};

/**
 * Patch node-validator's validators for our API.
 */

var validatorFormats = (function() {
  var prototype = require('validator').Validator.prototype;
  var patchValidator = function(validator) {
    return function(instance) {
      return !!validator.call({str: instance, error: function() {}});
    }
  };

  validators = {};
  validators.email   = patchValidator(prototype.isEmail);
  validators.url     = patchValidator(prototype.isUrl);
  validators.ip      = patchValidator(prototype.isIP);
  validators.int     = patchValidator(prototype.isInt);
  validators.integer = validators.int;
  validators.decimal = patchValidator(prototype.isDecimal);
  validators.float   = validators.decimal;
  validators.uuid    = patchValidator(prototype.isUUID);

  return validators;
})();

formatValidators.add(validatorFormats);
