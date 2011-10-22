/*!
 * Contracts - filters
 * Copyright(c) 2011 Eirikur Nilsson <eirikur@nilsson.is>
 * MIT Licensed
 */

/**
 * Built in filters
 */

var builtInFilters = {};

builtInFilters.cleanObject = function(value, schema) {
  var key
    , isOwn = Object.prototype.hasOwnProperty
    , allowedProps = schema.getValueOfProperty("properties");

  for (key in value) {
    if (allowedProps[key] === undefined && isOwn.call(value, key)) {
      delete value[key];
    }
  }
  return value;
};

builtInFilters.cleanArray = function(value, schema) {
  var len, i, items = schema.getProperty("items");
  if (items.getType() === "array") {
    for (var i = items.getValue().length, len = value.length; i < len; i++) {
      delete value[i];
    }
  }
  return value;
};

builtInFilters.removeEmpty = function(value, schema) {
  return value === "" || value === null ? undefined : value;
};

/**
 * A chainable api for filters.
 */

var FilterChain = function FilterChain() {
  var self = function() { return self.run.apply(self, arguments); };
  self.__proto__ = FilterChain.prototype;
  self.chain = [];
  return self;
};

/**
 * Runs all the filters in this chain.
 */

FilterChain.prototype.run = function(value, schema) {
  var i, len, value;
  for (i = 0, len = this.chain.length; i < len; i++) {
    value = this.chain[i](value, schema);
  }
  return value;
};

/**
 * The module export. An object that contains all the
 * available filters, each returning a FilterChain for
 * chaining further filters.
 */

var Filters = module.exports = {};

/**
 * Make the export extend FilterChain's prototype chain
 * have all filters in the same place.
 */

Filters.__proto__ = FilterChain.prototype;

/**
 * Defines new filters.
 */

Filters.add = function(name, filter) {
  var filters = name;

  if ('string' == typeof filters) {
    filters = {};
    filters[name] = filter;
  }

  for (var key in filters) {
    FilterChain.prototype[key] = (function(filter) {
      return function addToChain() {
        var otherArgs;

        if (!this.chain) {
          return addToChain.apply(new FilterChain, arguments);
        }

        if (arguments.length) {
          otherArgs = Array.prototype.slice.call(arguments, 0);

          this.chain.push(function(value, schema) {
            return filter.apply(null, [value, schema].concat(otherArgs));
          });
        } else {
          this.chain.push(filter);
        }
        return this;
      };
    })(filters[key]);
  }
};

/**
 * Export the FilterChain class
 */

Filters.FilterChain = FilterChain;

/**
 * Define the default filters.
 */

Filters.add(builtInFilters);

/**
 * Patch node-validator's filters to be chainable in our API.
 */

var validatorFilters = (function() {
  var prototype = require('validator').Filter.prototype
    , skip = ['convert', 'sanitize', 'modify', 'value', 'chain', 'wrap']
    , filters = {}
    , key, fakeThis;
  fakeThis = { str: null, wrap: function(str) { return str; }, modify: function(str) { this.str = str; } };

  for (key in prototype) {
    if (~skip.indexOf(key))
      continue;

    filters[key] = (function(realFilter) {
      return function(value) {
        var args = Array.prototype.slice.call(arguments, 2);
        fakeThis.str = value;
        return realFilter.apply(fakeThis, args);
      };
    })(prototype[key]);
  }

  return filters;
})();

/**
 * Add node-validators filters to our API.
 */

Filters.add(validatorFilters);
