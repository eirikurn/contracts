var contracts = require('contracts')
  , validate = contracts.validate
  , f = contracts.filters
  , assert = require('assert')
  , should = require('should');

module.exports = {
  'NaN is not a number': function() {
    var report = validate(NaN, {type: 'number'});
    report.errors.length.should.equal(1);
  }
};
