var jsv = require('JSV').JSV;

var environment = jsv.createEnvironment("json-schema-draft-03");

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
        newValue = filter.run(instance.getValue(), schema);
        instance._value = newValue;
        if (parent) {
          parent._value[name] = newValue;
        }
      } catch(e) { console.log(e); }
    }

    oldValidator.apply(this, arguments);
  }
});

schemaSchema = environment.createSchema(schemaSchemaJson, true, "http://contracts.nilsson.is/schema#");
environment.setOption("defaultSchemaURI", "http://contracts.nilsson.is/schema#");

module.exports = environment;
