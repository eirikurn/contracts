var contracts = require('contracts')
  , validate = contracts.validate
  , f = contracts.filters
  , assert = require('assert')
  , should = require('should');

module.exports = {
  'NaN is not a number': function() {
    var report = validate(NaN, {type: 'number'});
    report.errors.length.should.equal(1);
  },

  'Filter can transform instance before validation': function() {
    var schema = {type: 'number', filter: function(value) { return parseInt(value, 10); }};
    var report = validate("5", schema);
    report.errors.length.should.equal(0);
    report.instance.should.equal(5);
  },

  'Possible to register and reference schemas': function() {
    contracts.schema({
      "id": "test",
      "type": "string"
    });
    var report = validate(5, {$ref: "test"});
    report.errors.length.should.equal(1);
    report.errors[0].attribute.should.equal('type');
  },
};
