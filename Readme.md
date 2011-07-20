# Contracts

Define contracts for functions and express handlers to validate and filter parameters. This library bundles the [Json Schema Validator](https://github.com/garycourt/JSV) package with customizable format validation and filter support. It includes some nice filters and formats from the [node-validator](https://github.com/chriso/node-validator) library.

## Defining Schemas

    var contracts = require('contracts')
      , f = contracts.filters;

    var addSchema = {
      type: 'array',
      items: {
        type: 'number',
        filter: f.toFloat()
      }
    };

    var userSchema = {
      type: 'object',
      additionalProperties: false,
      filters: f.cleanObject(),
      properties: {
        email: { type: 'string', required: true, format: 'email' },
        password: { type: 'string', required: true, minLength: 6 },
        age: { type: 'integer', required: true, filter: f.toInt() }
      }
    };

## Validating to a schema

    var report = contracts.validate([5, '13', 8], addSchema);
    report.errors;   // []
    report.instance; // [5, 13, 8]

## Transforming data using a schema

    var new_obj = contracts.transform({email: 'foo@bar.com', password: 'foobar', age: '15', DANGEROUS: '...'}, userSchema);
    new_obj; // {email: 'foo@bar.com', password: 'foobar', age: 15}

## Wrapping functions for validation and data-fixing

    var add = contracts.wrap(function() {
      var args = [].slice.call(arguments)
        , sum = args.reduce(function(a,b) { return a + b; }, 0);
      return sum;
    }, addSchema);
    
    add('5', '19.5', 3); // 27.5
    add(1, {});          // throw ValidationError()

## Validating post data in express with a view middleware

    var app = express.createServer();
    app.use express.bodyParser();

    app.post('/users', contracts.view(userSchema), function(req, res) {
        req.body; // {email: 'foo@bar.com', password: 'foobar', age: '15', DANGEROUS: '...'}
        req.data; // {email: 'foo@bar.com', password: 'foobar', age: 15}
    });

## Built-in filters

* cleanObject
* cleanArray
* removeEmpty

From node-validator:

* xss
* entityDecode
* entityEncode
* ltrim
* rtrim
* trim
* ifNull
* toFloat
* toInt
* toBoolean
* toBooleanStrict

## Built-in format validators

From node-validator:

* email
* url
* ip
* int
* decimal
* float
* uuid

## Custom filters

    var schema = {
      type: 'string',
      filter: function(str) {
        return str.replace(/-/g, '');
      }
    }

    contracts.filters.add('stripSlashes', function(str) { return str.replace(/-/g, ''); });
    schema = {
      type: 'string',
      filter: contracts.filters.stripSlashes().trim()
    }

## Custom formats

    contracts.formats.add('ssn', function(str) {
      // TODO: Validate that str is a ssn.
      return true;
    });

    var schema = {
      type: 'string',
      format: 'ssn'
    }

## License 

(The MIT License)

Copyright (c) 2011 Eirikur Nilsson &lt;eirikur@nilsson.is&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

