"use strict";

/**
 * The validator base class.
 * @type {Function}
 */
exports.Validator = require('./validator');

/**
 * A list of builtin validators.
 * @type {Object}
 */
exports.validators = Object.create(null);

/**
 * Define a validator with the given name.
 *
 * @param  {String}    name        The name of the validator.
 * @param  {Object}    descriptors The descriptors for the validator.
 * @return {Function}              The created validator class.
 */
exports.define = function (name, descriptors) {
  if (typeof descriptors === 'function') {
    exports.validators[name] = descriptors;
  }
  else {
    exports.validators[name] = exports.Validator.extend(descriptors);
  }
  return exports.validators[name];
};


/**
 * Create an instance of a validator with the given name.
 *
 * @param  {String}    name       The name of the validator to create.
 * @param  {Object}    properties The properties / configuration for the validator.
 * @return {Validator}            The created validator instance.
 */
exports.create = function (name, properties) {
  return exports.validators[name].create(properties);
};

/**
 * Create a function which can validate objects based on the given descriptors.
 *
 * @param  {Object}   descriptors The descriptors to validate against.
 * @return {Function}             The validation function.
 */
exports.forDescriptors = function (descriptors) {
  pre: {
    descriptors && typeof descriptors === 'object', 'Descriptors must be an object.';
  }
  main: {
    var names = Object.keys(descriptors),
        total = names.length,
        validators = [],
        lines = [],
        descriptor, name, items, i, accessor;

    for (i = 0; i < total; i++) {
      name = names[i];
      descriptor = descriptors[name];
      if (/^([\w|_|$]+)$/.test(name)) {
        accessor = '.' + name;
      }
      else {
        accessor = '["' + name + '"]';
      }
      if (descriptor.rules) {
        items = descriptor.rules.map(processRule).map(function (validator) {
          var index = validators.push(validator) - 1;
          return 'if ((result = validators[' + index + '].validate(obj' + accessor + ')) !== true) {\n' +
                 '  isValid = false;\n' +
                 '  errors' + accessor + ' = result;\n' +
                 '}\n';
        });
        lines.push(items.join('else '));
      }
    }
    var body = 'var isValid = true,\n' +
               '    errors = {},\n' +
               '    result;\n\n' +
              lines.join('\n') + '\n' +
              'return {valid: isValid, errors: errors};';
    var fn = new Function('validators', 'obj', body); // jshint ignore: line

    return fn.bind(undefined, validators);
  }
  post: {
    typeof __result === 'function';
  }
};

/**
 * Process a rule for a descriptor.
 *
 * @param  {Array|Function|Object} rule The validation rule, or inline function.
 * @return {Validator}                  The validator instance.
 */
function processRule (rule) {
  pre: {
    if (typeof rule !== 'function') {
      (Array.isArray(rule) && rule[0]) || rule.name, "Validator name must be specified.";
    }
  }
  main: {
    if (typeof rule === 'function') {
      return new exports.Validator({
        validate: rule
      });
    }
    else if (Array.isArray(rule)) {
      return exports.create.apply(exports, rule);
    }
    else {
      return exports.create(rule.name, rule);
    }
  }
  post: {
    __result instanceof exports.Validator;
  }
}

// define the builtin validators

var validators = require('./validators'),
    names = Object.keys(validators),
    total = names.length,
    name, i;

for (i = 0; i < total; i++) {
  name = names[i];
  exports.define(name, validators[name]);
}