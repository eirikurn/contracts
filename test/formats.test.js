var contracts = require('../')
  , validate = contracts.validate
  , assert = require('assert')
  , should = require('should');

module.exports = {
  /**
   * Test formats inherited from node-validator library.
   */
  'email format': function() {
    fails({"format": "email"}, "not-email");
    succeeds({"format": "email"}, "some@email.is");
  },
  'url format': function() {
    fails({"format": "url"}, "not-url");
    succeeds({"format": "url"}, "http://contracts.com");
  },
  'ip format': function() {
    fails({"format": "ip"}, "not-ip");
    succeeds({"format": "ip"}, "192.168.1.1");
  },
  'int format': function() {
    fails({"format": "int"}, "not-int");
    fails({"format": "int"}, "5.123");
    succeeds({"format": "int"}, "1234");
  },
  'decimal format': function() {
    fails({"format": "decimal"}, "not-decimal");
    succeeds({"format": "decimal"}, "5.123");
    succeeds({"format": "decimal"}, "1234");
  },
  'uuid format': function() {
    fails({"format": "uuid"}, "not-uuid");
    succeeds({"format": "uuid"}, "550e8400-e29b-41d4-a716-446655440000");
  },

  'formats are directly callable': function() {
    should.exist(contracts.formats.email);
    contracts.formats.email("some@email.com").should.equal(true);
  },

  /**
   * Custom format
   */
  'custom format': function() {
    contracts.formats.add("capitalized", function(value) { return value[0] === value[0].toUpperCase(); });
    succeeds({"format": "capitalized"}, "Eiki");
    fails({"format": "capitalized"}, "eiki");
  }
};

var succeeds = function(schema, value) {
  var report = validate(value, schema);
  report.errors.length.should.equal(0, JSON.stringify(value) + " should validate to " + JSON.stringify(schema));
};

var fails = function(schema, value) {
  var report = validate(value, schema);
  report.errors.length.should.not.equal(0, JSON.stringify(value) + " should not validate to " + JSON.stringify(schema));
};