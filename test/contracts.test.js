var c = require('../')
  , f = c.filters
  , assert = require('assert')
  , should = require('should');

module.exports = {
  'validate()': function() {
    var report = c.validate(5, { type: 'string' });
    report.errors.length.should.not.equal(0);
    var report = c.validate("foo", { type: 'string' });
    report.errors.length.should.equal(0);
    report.instance.should.equal("foo");
  },

  'transform()': function() {
    var report = c.transform("5", { filter: f.toInt() });
    report.should.equal(5);
    assert.throws(function() { c.transform("5", { type: "integer" }); }, c.ValidationError);
  },

  'wrap()': function() {
    var schema = { items: [{type: 'string'}], filter: f.cleanArray() };
    var wrapped = c.wrap(schema, function(str1, str2) {
      should.not.exist(str2);
    });
    wrapped("foo", "bar");
    assert.throws(function() { wrapped(5, 6); }, c.ValidationError);
  },

  'view()': function() {
    var schema = { filter: f.toInt(), type: 'integer' };
    var viewMiddleware = c.view(schema);

    req = {body: '5'};
    called = false;
    viewMiddleware(req, {}, function() { called = true; });
    called.should.be.true;
    req.data.should.equal(5);

    req = {body: 'foobar'};
    called = false;
    viewMiddleware(req, {}, function(error) {
      error.should.be.an.instanceof(c.ValidationError);
      called = true;
    });
    called.should.be.true;
    should.not.exist(req.data);
  }
};

