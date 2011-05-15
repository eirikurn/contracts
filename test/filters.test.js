var contracts = require('contracts')
  , validate = contracts.validate
  , f = contracts.filters
  , assert = require('assert')
  , should = require('should');

module.exports = {

  'skipExtraProps()': function() {
    var schema = { filter: f.skipExtraProps(), properties: { a: {} } };
    var report = validate({ c: 5, a: 1, b: 2 }, schema);
    var instance = report.instance.getValue();
    assert.deepEqual(instance, { a: 1 });
  },

  'skipExtraItems()': function() {
    var schema = { filter: f.skipExtraItems(), items: [{}, {}] };
    var report = validate([1, 2, 3, 4], schema);
    var instance = report.instance.getValue();
    assert.deepEqual(instance, [1, 2]);
  },

  /**
   * Test filters inherited from node-validator library.
   */
  'toBoolean()': function() {
    var schema = { type: "boolean", filter: f.toBoolean() };
    transforms(schema, "true", true);
    transforms(schema, "anything", true);
    transforms(schema, "false", false);
    transforms(schema, undefined, false);
    transforms(schema, true, true);
  },
  'toBooleanStrict()': function() {
    var schema = { type: "boolean", filter: f.toBooleanStrict() };
    transforms(schema, "true", true);
    transforms(schema, "anything", false);
    transforms(schema, "false", false);
    transforms(schema, undefined, false);
    transforms(schema, true, true);
  },
  'toInt()': function() {
    var schema = { type: "integer", filter: f.toInt() };
    transforms(schema, "5", 5);
    transforms(schema, -2, -2);
    transforms(schema, 5.5, 5);
    fails(schema, "asdfasdf");
  },
  'toFloat()': function() {
    var schema = { type: "number", filter: f.toFloat() };
    transforms(schema, "5.8", 5.8);
    transforms(schema, 5.5, 5.5);
    fails(schema, "asdfasdf");
  },
  'ifNull()': function() {
    var schema = { filter: f.ifNull("bar") };
    transforms(schema, "foo", "foo");
    transforms(schema, "", "bar");
    transforms(schema, undefined, "bar");
  },
  'trim()': function() {
    transforms({ filter: f.trim() }, "  foo  ", "foo");
    transforms({ filter: f.trim('a') }, "a foo a", " foo ");
  },
  'rtrim()': function() {
    transforms({ filter: f.rtrim() }, "  foo  ", "  foo");
    transforms({ filter: f.rtrim('a') }, "a foo a", "a foo ");
  },
  'ltrim()': function() {
    transforms({ filter: f.ltrim() }, "  foo  ", "foo  ");
    transforms({ filter: f.ltrim('a') }, "a foo a", " foo a");
  },
  'entityEncode()': function() {
    var schema = { filter: f.entityEncode() };
    transforms(schema, "&'\"", "&amp;&#39;&quot;");
  },
  'entityDecode()': function() {
    var schema = { filter: f.entityDecode() };
    transforms(schema, "&amp;&#39;&quot;", "&'\"");
  },
  'xss()': function() {
    var schema = { filter: f.xss() };
    transforms(schema, "javascript  : foobar", "[removed] foobar");
    transforms(schema, "j a vasc ri pt: foobar", "[removed] foobar");
  }
};

var transforms = function(schema, before, after) {
  var report = validate(before, schema);
  report.errors.length.should.equal(0);
  report.instance.getValue().should.equal(after);
};

var fails = function(schema, value) {
  var report = validate(value, schema);
  report.errors.length.should.not.equal(0);
};
