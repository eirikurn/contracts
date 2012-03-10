/*!
 * Contracts - schema
 * Copyright(c) 2011 Eirikur Nilsson <eirikur@nilsson.is>
 * MIT Licensed
 */

var jsv = require('JSV').JSV;

var environment = jsv.createEnvironment("json-schema-draft-03");

/**
 * Patch JSV so it always clones instances before validation
 * so filters don't affect the original object.
 */
environment.createInstance = function(data, uri) {
  data = jsv.clone(data, true);
  return jsv.Environment.prototype.createInstance.call(this, data, uri);
};

var schemaSchema = environment.getDefaultSchema()
  , oldValidator = schemaSchema.getAttribute("validator");

schemaSchemaJson = jsv.inherits(schemaSchema, {
  /**
   * Patch the number type validator to not report NaN's as numbers.
   */
  "properties": {
    "type": {
      "typeValidators": {
        "number": function(instance, report) {
          return instance.getType() === "number" && !isNaN(instance.getValue());
        }
      }
    }
  },

  /**
   * Patch it to run filters before running validators.
   */
  "validator": function(instance, schema, self, report, parent, parentSchema, name) {
    var newValue, filter = schema.getValueOfProperty("filter");

    if (filter) {
      try {
        newValue = filter(instance.getValue(), schema);
        instance._value = newValue;
        if (parent) {
          if (newValue !== undefined) {
            parent._value[name] = newValue;
          } else if (jsv.typeOf(parent._value) === "array") {
            parent._value.splice(name, name + 1);
          } else {
            delete parent._value[name];
          }
        }
      } catch(e) {
        console.log("Unexpected error while running filter", e);
      }
    }

    oldValidator.apply(this, arguments);
  }
});

/**
 * Patch format validators with our own object so it can be modified at run-time.
 */
schemaSchemaJson.properties.format.formatValidators = require('./formats').jsvValidators;

schemaSchema = environment.createSchema(schemaSchemaJson, true, "http://contracts.nilsson.is/schema#");
environment.setOption("defaultSchemaURI", "http://contracts.nilsson.is/schema#");

module.exports = environment;
