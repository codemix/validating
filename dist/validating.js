(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var OBLIGATIONS = require('obligations');
'use strict';
/**
 * The validator base class.
 * @type {Function}
 */
exports.Validator = require('./validator');
/**
 * A list of builting validators.
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
    } else {
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
    var names = Object.keys(descriptors), total = names.length, validators = [], lines = [], descriptor, name, items, i, accessor;
    for (i = 0; i < total; i++) {
        name = names[i];
        descriptor = descriptors[name];
        if (/^([\w|_|$]+)$/.test(name)) {
            accessor = '.' + name;
        } else {
            accessor = '["' + name + '"]';
        }
        if (descriptor.rules) {
            items = descriptor.rules.map(processRule).map(function (validator) {
                var index = validators.push(validator) - 1;
                return 'if ((result = validators[' + index + '].validate(obj' + accessor + ')) !== true) {\n' + '  isValid = false;\n' + '  errors' + accessor + ' = result;\n' + '}\n';
            });
            lines.push(items.join('else '));
        }
    }
    var body = 'var isValid = true,\n' + '    errors = {},\n' + '    result;\n\n' + lines.join('\n') + '\n' + 'return {valid: isValid, errors: errors};';
    var fn = new Function('validators', 'obj', body);
    // jshint ignore: line
    return fn.bind(undefined, validators);
};
/**
 * Process a rule for a descriptor.
 *
 * @param  {Array|Function|Object} rule The validation rule, or inline function.
 * @return {Validator}                  The validator instance.
 */
function processRule(rule) {
    if (typeof rule !== 'function') {
        OBLIGATIONS.precondition(Array.isArray(rule) && rule[0] || rule.name, 'Validator name must be specified.');
    }
    var __result;
    main: {
        if (typeof rule === 'function') {
            __result = new exports.Validator({ validate: rule });
            break main;
        } else if (Array.isArray(rule)) {
            __result = exports.create.apply(exports, rule);
            break main;
        } else {
            __result = exports.create(rule.name, rule);
            break main;
        }
    }
    OBLIGATIONS.postcondition(__result instanceof exports.Validator);
    return __result;
}
// define the builtin validators
var validators = require('./validators'), names = Object.keys(validators), total = names.length, name, i;
for (i = 0; i < total; i++) {
    name = names[i];
    exports.define(name, validators[name]);
}
},{"./validator":2,"./validators":3,"obligations":5}],2:[function(require,module,exports){
'use strict';
var Class = require('classing');
/**
 * Base class for Validators.
 */
module.exports = Class.create({
    /**
   * Defines the error messages for the validator.
   *
   * @type {Object} an object containing the error messages.
   */
    messages: {
        default: function () {
            return { default: 'Invalid value.' };
        }
    },
    /**
   * Accessors for the default message.
   */
    message: {
        get: function () {
            return this.messages.default;
        },
        set: function (value) {
            this.messages.default = value;
        }
    },
    /**
   * Whether to allow empty values.
   *
   * @type {Boolean}
   */
    allowEmpty: { value: false },
    /**
   * Determine whether the given value is empty.
   *
   * @param  {mixed}  value  The value to examine.
   * @return {Boolean}       true if the value is empty, otherwise false.
   */
    isEmpty: function (value) {
        if (value == null || value === '') {
            return true;
        } else if (Array.isArray(value) && value.length === 0) {
            return true;
        } else if (typeof value === 'object' && Object.keys(value).length === 0) {
            return true;
        } else {
            return false;
        }
    },
    /**
   * Prepare the given error message.
   *
   * @param  {String} message    The message to prepare.
   * @param  {Object} references The tokens to replace in the message.
   * @return {String}            The prepared error message.
   */
    prepare: function (message, references) {
        return message.replace(/\{\{(\w+)\}\}/g, function (token, item) {
            return references[item] || '';
        });
    },
    /**
   * Validate the given value.
   *
   * > Note: child classes should override this.
   *
   * @return {Boolean|String} If the value is valid, then `true`, otherwise a string containing
   *                          the error message.
   */
    validate: function (value) {
        return true;
    }
});
},{"classing":4}],3:[function(require,module,exports){
var OBLIGATIONS = require('obligations');
'use strict';
/**
 * # Required Validator
 *
 * Ensures that a given value is present.
 *
 * @type {Validator}
 */
exports.required = {
    messages: {
        default: function () {
            return { default: 'Cannot be empty.' };
        }
    },
    validate: function (value) {
        if (this.isEmpty(value)) {
            return this.message;
        } else {
            return true;
        }
    }
};
/**
 * # Type Validator
 *
 * Ensures that a given value has the correct JavaScript type.
 *
 * @type {Function}
 */
exports.type = {
    messages: {
        default: function () {
            return { default: 'Expected {{expected}}, got {{got}}.' };
        }
    },
    type: { value: 'string' },
    validate: function (value) {
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        }
        var expected = this.type, got = typeof value;
        // hack around `typeof null === 'object'`
        if (expected === 'null' && value === null) {
            return true;
        } else if (expected === got) {
            return true;
        } else {
            return this.prepare(this.message, {
                got: got,
                expected: expected
            });
        }
    }
};
/**
 * # InstanceOf Validator
 *
 * Ensures that a given value is an object that is an instance of the given class.
 *
 * @type {Function}
 */
exports.instanceOf = {
    messages: {
        default: function () {
            return { default: 'Expected {{expected}}, got {{got}}.' };
        }
    },
    class: {},
    className: {
        get: function () {
            OBLIGATIONS.precondition(this.class, 'Class must be specified');
            OBLIGATIONS.precondition(typeof this.class === 'string' || typeof this.class === 'function', 'Class must be a string or a function.');
            return typeof this.class === 'string' ? this.class : this.class.name;
        }
    },
    validate: function (value) {
        OBLIGATIONS.precondition(this.class, 'Class must be specified');
        OBLIGATIONS.precondition(typeof this.class === 'string' || typeof this.class === 'function', 'Class must be a string or a function.');
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        }
        var className = this.className, references;
        if (!value || typeof value !== 'object' || !value.constructor) {
            references = {
                expected: className,
                got: value === null ? 'null' : typeof value
            };
        } else {
            if (typeof this.class === 'function') {
                if (value instanceof this.class) {
                    return true;
                }
            } else if (value.constructor.name === className) {
                return true;
            }
            references = {
                expected: className,
                got: value.constructor.name
            };
        }
        return this.prepare(this.message, references);
    }
};
},{"obligations":5}],4:[function(require,module,exports){
"use strict";


/**
 * Main entry point
 */

function Classing (name, descriptors) {
  return Classing.create(name, descriptors);
}

module.exports = exports = Classing;

/**
 * Make a class with the given property descriptors.
 *
 * @param  {Object}   descriptors An object containing the property descriptors for the class.
 * @return {Function}             The created class.
 */
Classing.create = function (name, descriptors) {
  if (name && typeof name === 'string') {
    descriptors = descriptors || {};
  }
  else {
    descriptors = name || {};
    name = 'Class';
  }

  var Class = this.makeConstructor(name);

  this.makeStatic(Class, descriptors);
  this.makePrototype(Class, descriptors);

  return Class;
};

/**
 * Make a constructor for a class.
 *
 * @param  {String} name The name of the class.
 * @return {Function}    The constructor function.
 */
Classing.makeConstructor = function (name) {
  var body = 'return function ' + name + ' (config) {' +
             '  if (!(this instanceof ' + name + ')) {' +
             '    return new ' + name + '(config);' +
             '  }' +
             '  this.applyDefaults();' +
             '  if (config) { this.configure(config); }' +
             '  this.initialize();' +
             '};';
  return new Function(body)(); // jshint ignore:line
};

/**
 * Make the static methods for a class.
 *
 * @param  {Function} Class        The class itself.
 * @param  {Object}   descriptors  The property descriptors for the class.
 */
Classing.makeStatic = function (Class, descriptors) {
  var Classing = this; // to allow subclassing
  Object.defineProperties(Class, {
    /**
     * Create a new instance of the class.
     */
    create: {
      configurable: true,
      value: function (properties) {
        return new Class(properties);
      }
    },
    /**
     * Get the descriptors of the class.
     */
    descriptors: {
      value: descriptors
    },
    /**
     * Define a new property on the class.
     */
    defineProperty: {
      configurable: true,
      value: function (name, descriptor, skipReload) {
        descriptor = descriptor || {value: null};
        if (typeof descriptor === 'function') {
          // this is a method
          descriptor = {
            enumerable: false,
            configurable: true,
            writable: true,
            value: descriptor
          };
        }

        if (descriptor.value === undefined && !(descriptor.get || descriptor.set)) {
          descriptor.value = null;
        }

        if (descriptor.writable == null && descriptor.value !== undefined) {
          descriptor.writable = true;
        }
        if (descriptor.enumerable == null) {
          descriptor.enumerable = true;
        }
        if (descriptor.configurable == null) {
          descriptor.configurable = true;
        }
        descriptors[name] = descriptor;
        Object.defineProperty(this.prototype, name, descriptor);
        if (!skipReload) {
          if (!this.prototype.applyDefaults || this.prototype.applyDefaults.isAutoGenerated) {
            this.prototype.applyDefaults = this.makeApplyDefaults(descriptors);
          }
          if (!this.prototype.configure || this.prototype.configure.isAutoGenerated) {
            this.prototype.configure = this.makeConfigure(descriptors);
          }
          if (!this.prototype.toJSON || this.prototype.toJSON.isAutoGenerated) {
            this.prototype.toJSON = this.makeToJSON(descriptors);
          }
        }
        return this;
      }
    },
    /**
     * Define a list of properties on the class.
     */
    defineProperties: {
      configurable: true,
      value: function (items) {
        if (!items) {
          return this;
        }
        var keys = Object.keys(items),
            total = keys.length,
            key, i;

        for (i = 0; i < total; i++) {
          key = keys[i];
          this.defineProperty(key, items[key], true);
        }
        if (!this.prototype.applyDefaults || this.prototype.applyDefaults.isAutoGenerated) {
          this.prototype.applyDefaults = this.makeApplyDefaults(descriptors);
        }
        if (!this.prototype.configure || this.prototype.configure.isAutoGenerated) {
          this.prototype.configure = this.makeConfigure(descriptors);
        }
        if (!this.prototype.toJSON || this.prototype.toJSON.isAutoGenerated) {
          this.prototype.toJSON = this.makeToJSON(descriptors);
        }
        return this;
      }
    },
    /**
     * Inherit descriptors from another class.
     */
    inherits: {
      configurable: true,
      value: function (Super) {
        var keys = Object.keys(Super),
            total = keys.length,
            key, i;


        for (i = 0; i < total; i++) {
          key = keys[i];
          if (!this.hasOwnProperty(key)) {
            this[key] = Super[key];
          }
        }
        var superDescriptors = Super.descriptors || {};
        keys = Object.keys(superDescriptors);
        total = keys.length;
        for (i = 0; i < total; i++) {
          key = keys[i];
          if (!descriptors.hasOwnProperty(key)) {
            descriptors[key] = superDescriptors[key];
          }
        }
        descriptors.super = {
          enumerable: false,
          value: Super.prototype
        };
        this.prototype = Object.create(Super.prototype, descriptors);
        this.prototype.constructor = this;

        if (!this.prototype.toString || this.prototype.toString.isAutoGenerated) {
          this.prototype.toString = this.makeToString(descriptors);
        }
        if (!this.prototype.applyDefaults || this.prototype.applyDefaults.isAutoGenerated) {
          this.prototype.applyDefaults = this.makeApplyDefaults(descriptors);
        }
        if (!this.prototype.configure || this.prototype.configure.isAutoGenerated) {
          this.prototype.configure = this.makeConfigure(descriptors);
        }
        if (!this.prototype.toJSON || this.prototype.toJSON.isAutoGenerated) {
          this.prototype.toJSON = this.makeToJSON(descriptors);
        }

        return this;
      }
    },
    /**
     * Create a new class which extends from this one.
     */
    extend: {
      configurable: true,
      value: function (config) {
        var Child = Classing.create(config);
        Child.inherits(this);
        return Child;
      }
    },
    /**
     * Mix the properties from a source object into this one.
     * @type {Object}
     */
    mixin: {
      configurable: true,
      value: function (source) {
        var keys = Object.keys(source),
            total = keys.length,
            combined = {},
            key, i;

        for (i = 0; i < total; i++) {
          key = keys[i];
          combined[key] = {
            value: source[key]
          };
        }
        this.defineProperties(combined);
        return this;
      }
    },
    /**
     * Make an efficient `applyDefaults()` function to set
     * the default property values for a class instance.
     *
     * @param  {Object} descriptors The descriptors for the object.
     * @return {Function}           The `applyDefaults()` function.
     */
    makeApplyDefaults: {
      configurable: true,
      value: function (descriptors) {
        var keys = Object.keys(descriptors),
            total = keys.length,
            body = '',
            key, descriptor, i, suffix, value;

        for (i = 0; i < total; i++) {
          key = keys[i];
          descriptor = descriptors[key];
          if (descriptor.hasOwnProperty('default')) {
            suffix = '';
            if (typeof descriptor.default === 'function') {
              suffix = '(this)';
            }
            if (/^([\w|_|$]+)$/.test(key)) {
              body += 'this.' + key + ' = this.constructor.descriptors.' + key + '.default' + suffix + ';';
            }
            else {
              body += 'this["' + key + '"] = this.constructor.descriptors["' + key + '"].default' + suffix + ';';
            }
          }
          else if (descriptor.bind) {
            if (/^([\w|_|$]+)$/.test(key)) {
              if (descriptor.bind === true) {
                value = 'this';
              }
              else {
                value = 'this.constructor.descriptors.' + key + '.bind';
              }
              body += 'this.' + key + ' = this.' + key + '.bind(' + value + ');';
            }
            else {
              if (descriptor.bind === true) {
                value = 'this';
              }
              else {
                value = 'this.constructor.descriptors["' + key + '"].bind';
              }
              body += 'this["' + key + '"] = this["' + key + '"].bind(' + value + ');';
            }
          }
        }
        var applyDefaults = new Function(body); // jshint ignore:line
        applyDefaults.isAutoGenerated = true;
        return applyDefaults;
      }
    },
    /**
     * Make an efficient `configure()` function to set property values
     * for an object based on the given descriptors.
     *
     * @param  {Object} descriptors The descriptors for the object.
     * @return {Function}           The `configure()` function.
     */
    makeConfigure: {
      configurable: true,
      value: function (descriptors) {
        var keys = Object.keys(descriptors),
            total = keys.length,
            body = '',
            key, descriptor, i;

        for (i = 0; i < total; i++) {
          key = keys[i];
          descriptor = descriptors[key];
          if (descriptor.writable || descriptor.hasOwnProperty('set')) {
            if (/^([\w|_|$]+)$/.test(key)) {
              body += 'this.' + key + ' = config.' + key + ' !== undefined ? config.' + key + ' : this.' + key + ';'; // jshint ignore:line
            }
            else {
              body += 'this["' + key + '"] = config["' + key + '"] !== undefined ? config["' + key + '"] : this["' + key + '"];'; // jshint ignore:line
            }
          }
        }
        var configure = new Function('config', body); // jshint ignore:line
        configure.isAutoGenerated = true;
        return configure;
      }
    },
    /**
     * Make an efficient `toJSON()` function for an object
     * based on the given descriptors.
     *
     * @param  {Object} descriptors The descriptors for the object.
     * @return {Function}           The `toJSON()` function.
     */
    makeToJSON: {
      configurable: true,

      value: function (descriptors) {
        var keys = Object.keys(descriptors),
            total = keys.length,
            parts = [],
            key, descriptor, i;

        for (i = 0; i < total; i++) {
          key = keys[i];
          descriptor = descriptors[key];
          if (descriptor.enumerable || descriptor.enumerable == null) {
            if (/^([\w|_|$]+)$/.test(key)) {
              parts.push(key + ': this.' + key);
            }
            else {
              parts.push('"' + key + '": this["' + key + '"]');
            }
          }
        }
        var toJSON = new Function('return {' + parts.join(',') + '};'); // jshint ignore:line
        toJSON.isAutoGenerated = true;
        return toJSON;
      }
    },
    /**
     * Make an efficient `toString()` function for the class.
     *
     * @return {Function} The `toString()` function.
     */
    makeToString: {
      configurable: true,
      value: function () {
        var fn = new Function('return "[object ' + this.name + ']";'); // jshint ignore:line
        fn.isAutoGenerated = true;
        return fn;
      }
    }
  });
};

/**
 * Make a prototype for a class, based on the given descriptors.
 *
 * @param  {Function} Class       The class itself.
 * @param  {Object} descriptors   The descriptors for the class.
 */
Classing.makePrototype = function (Class, descriptors) {
  Class.defineProperties(descriptors);
  if (!descriptors.initialize) {
    Class.defineProperty('initialize', function () {});
  }

  // don't overwrite custom toString functions if supplied.
  if (!descriptors.hasOwnProperty('toString')) {
    Object.defineProperty(Class.prototype, 'toString', {
      configurable: true,
      writable: true,
      value: Class.makeToString(descriptors)
    });
  }

  // don't overwrite custom applyDefaults functions if supplied.
  if (!descriptors.hasOwnProperty('applyDefaults')) {
    Object.defineProperty(Class.prototype, 'applyDefaults', {
      configurable: true,
      writable: true,
      value: Class.makeApplyDefaults(descriptors)
    });
  }

  // don't overwrite custom configure functions if supplied.
  if (!descriptors.hasOwnProperty('configure')) {
    Object.defineProperty(Class.prototype, 'configure', {
      configurable: true,
      writable: true,
      value: Class.makeConfigure(descriptors)
    });
  }

  // don't overwrite custom toJSON functions if supplied.
  if (!descriptors.hasOwnProperty('toJSON')) {
    Object.defineProperty(Class.prototype, 'toJSON', {
      configurable: true,
      writable: true,
      value: Class.makeToJSON(descriptors)
    });
  }
};

/**
 * Extend the class factory.
 *
 * @param  {Object} descriptors The descriptors for the new class factory.
 * @return {Classing}            The class factory
 */
Classing.extend = function (descriptors) {
  descriptors = descriptors || {};

  function Child (descriptors) {
    return Child.create(descriptors);
  }


  var keys = Object.keys(this),
      total = keys.length,
      i, key;


  for (i = 0; i < total; i++) {
    key = keys[i];
    Child[key] = this[key];
  }

  keys = Object.keys(descriptors);
  total = keys.length;


  for (i = 0; i < total; i++) {
    key = keys[i];
    if (typeof descriptors[key] === "function") {
      descriptors[key] = {
        configurable: true,
        value: descriptors[key]
      };
    }
  }

  Object.defineProperties(Child, descriptors);
  Child.super = this;
  return Child;
};
},{}],5:[function(require,module,exports){
/**
 * # Precondition Error
 * Thrown when a precondition fails.
 *
 * @param {String}   message The error message.
 * @param {Function} caller  The function that threw the error, used for cleaning stack traces.
 */
function PreconditionError(message, caller) {
  this.name = 'PreconditionError';
  this.message = message || 'Precondition failed';
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, caller || PreconditionError);
  }
}
PreconditionError.prototype = Object.create(Error.prototype);
PreconditionError.prototype.constructor = PreconditionError;

/**
 * # Postcondition Error
 * Thrown when a postcondition fails.
 *
 * @param {String} message   The error message.
 * @param {Function} caller  The function that threw the error, used for cleaning stack traces.
 */
function PostconditionError(message, caller) {
  this.name = 'PostconditionError';
  this.message = message || 'Postcondition failed';
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, caller || PreconditionError);
  }
}
PostconditionError.prototype = Object.create(Error.prototype);
PostconditionError.prototype.constructor = PreconditionError;


/**
 * # Invariant Error
 * Thrown when an invariant fails.
 *
 * @param {String} message   The error message.
 * @param {Function} caller  The function that threw the error, used for cleaning stack traces.
 */
function InvariantError(message, caller) {
  this.name = 'InvariantError';
  this.message = message || 'Invariant failed';
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, caller || InvariantError);
  }
}
InvariantError.prototype = Object.create(Error.prototype);
InvariantError.prototype.constructor = InvariantError;


/**
 * # Precondition
 * Asserts that a precondition is truthy.
 *
 * @param  {Mixed}              subject  The subject to assert.
 * @param  {String}             message  The optional message for the assertion.
 * @throws {PreconditionError}           If the subject is falsey.
 */
function precondition(subject, message) {
  if (!subject) {
    throw new PreconditionError(message, precondition);
  }
}

/**
 * # Postcondition
 * Asserts that a postcondition is truthy.
 *
 * @param  {Mixed}               subject  The subject to assert.
 * @param  {String}              message  The optional message for the assertion.
 * @throws {PostconditionError}           If the subject is falsey.
 */
function postcondition(subject, message) {
  if (!subject) {
    throw new PostconditionError(message, postcondition);
  }
}

/**
 * # Invariant
 * Asserts that an invariant is truthy.
 *
 * @param  {Mixed}              subject  The subject to assert.
 * @param  {String}             message  The optional message for the assertion.
 * @throws {PreconditionError}           If the subject is falsey.
 */
function invariant(subject, message) {
  if (!subject) {
    throw new InvariantError(message, invariant);
  }
}



exports.PreconditionError = PreconditionError;
exports.PostconditionError = PostconditionError;
exports.InvariantError = InvariantError;
exports.precondition = precondition;
exports.postcondition = postcondition;
exports.invariant = invariant;
},{}]},{},[1])