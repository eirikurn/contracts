var contracts = require('contracts')
  , f = contracts.filters
  , assert = require('assert')
  , should = require('should');

module.exports = {
  'Custom environment can change instance': function() {
    var instance = { };
    var report = contracts.environment.validate(instance, { type: 'object', properties: { a: {type: 'integer', filter: f.ifNull("5").toInt()} } });
    instance = report.instance.getValue();
    report.errors.length.should.equal(0);
    instance.should.have.property('a').with.a('number');
    instance.a.should.equal(5);
  }
};
