"use strict";

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
      return {
        default: 'Cannot be empty.'
      };
    }
  },
  validate: function (value) {
    if (this.isEmpty(value)) {
      return this.message;
    }
    else {
      return true;
    }
  }
};

/**
 * # Type Validator
 *
 * Ensures that a given value has the correct JavaScript type.
 *
 * @type {Validator}
 */
exports.type = {
  messages: {
    default: function () {
      return {
        default: 'Expected {{expected}}, got {{got}}.'
      };
    }
  },
  type: {
    value: 'string'
  },
  validate: function (value) {
    if (this.allowEmpty && this.isEmpty(value)) {
      return true;
    }
    var expected = this.type,
        got = typeof value;


    // hack around `typeof null === 'object'`
    if (expected === 'null' && value === null) {
      return true;
    }
    else if (expected === got) {
      return true;
    }
    else {
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
 * @type {Validator}
 */
exports.instanceOf = {
  messages: {
    default: function () {
      return {
        default: 'Expected {{expected}}, got {{got}}.'
      };
    }
  },
  class: {},
  className: {
    get: function () {
      pre: {
        this.class, 'Class must be specified';
        typeof this.class === 'string' || typeof this.class === 'function', 'Class must be a string or a function.';
      }
      main: {
        return typeof this.class === 'string' ? this.class : this.class.name;
      }
    }
  },
  validate: function (value) {
    pre: {
      this.class, 'Class must be specified';
      typeof this.class === 'string' || typeof this.class === 'function', 'Class must be a string or a function.';
    }
    main: {
      if (this.allowEmpty && this.isEmpty(value)) {
        return true;
      }
      var className = this.className,
          references;
      if (!value || typeof value !== 'object' || !value.constructor) {
        references = {
          expected: className,
          got: value === null ? 'null' : typeof value
        };
      }
      else {
        if (typeof this.class === 'function') {
          if (value instanceof this.class) {
            return true;
          }
        }
        else if (value.constructor.name === className) {
          return true;
        }
        references = {
          expected: className,
          got: value.constructor.name
        };
      }
      return this.prepare(this.message, references);
    }
  }
};

/**
 * # Length Validator
 *
 * Validates the length of the given string, array or object.
 *
 * @type {Validator}
 */
exports.length = {
  messages: {
    default: function () {
      return {
        invalid: 'The value is invalid.',
        tooShortString: 'Too short, should be at least {{min}} character(s).',
        tooLongString: 'Too long, should be at most {{max}} character(s).',
        tooShortArray: 'Too short, should contain at least {{min}} item(s).',
        tooLongArray: 'Too long, should contain at most {{max}} item(s).',
        tooShortObject: 'Too short, should contain at least {{min}} key(s).',
        tooLongObject: 'Too long, should contain at most {{max}} key(s).'
      };
    }
  },
  min: {},
  max: {},
  validate: function (value) {
    pre: {
      this.min || this.max, 'No constraints specified for length validator.';
    }
    main: {
      if (this.allowEmpty && this.isEmpty(value)) {
        return true;
      }
      else if (typeof value === 'string') {
        return this.validateString(value);
      }
      else if (Array.isArray(value)) {
        return this.validateArray(value);
      }
      else if (value && typeof value === 'object') {
        return this.validateObject(value);
      }
      else {
        return this.messages.invalid; // invalid type
      }
    }
  },
  validateString: function (value) {
    pre: {
      typeof value === 'string', 'Value must be a string.';
    }
    main: {
      if (this.min && value.length < this.min) {
        return this.prepare(this.messages.tooShortString);
      }
      else if (this.max && value.length > this.max) {
        return this.prepare(this.messages.tooLongString);
      }
      else {
        return true;
      }
    }
  },
  validateArray: function (value) {
    pre: {
      Array.isArray(value), 'Value must be an array.';
    }
    main: {
      if (this.min && value.length < this.min) {
        return this.prepare(this.messages.tooShortArray);
      }
      else if (this.max && value.length > this.max) {
        return this.prepare(this.messages.tooLongArray);
      }
      else {
        return true;
      }
    }
  },
  validateObject: function (value) {
    pre: {
      value && typeof value === 'object', 'Value must be an object.';
    }
    main: {
      var keys = Object.keys(value);
      if (this.min && keys.length < this.min) {
        return this.prepare(this.messages.tooShortObject);
      }
      else if (this.max && keys.length > this.max) {
        return this.prepare(this.messages.tooLongObject);
      }
      else {
        return true;
      }
    }
  }
};

/**
 * # Number Validator
 *
 * Ensures that a given value is a number within the specified range.
 *
 * @type {Validator}
 */
exports.number = {
  messages: {
    default: function () {
      return {
        invalid: "Expected a number.",
        tooSmall: "Must be at least {{min}}.",
        tooLarge: "Must be at most {{max}}."
      };
    }
  },
  min: {},
  max: {},
  validate: function (value) {
    if (this.allowEmpty && this.isEmpty(value)) {
      return true;
    }
    else if (typeof value !== 'number') {
      return this.messages.invalid;
    }
    else if (this.min && value < this.min) {
      return this.prepare(this.messages.tooSmall);
    }
    else if (this.max && value > this.max) {
      return this.prepare(this.messages.tooLarge);
    }
    else {
      return true;
    }
  }
};

/**
 * # Boolean Validator
 *
 * Ensures that the given value is true or false.
 *
 * @type {Function}
 */
exports.boolean = {
  messages: {
    default: function () {
      return {
        default: 'Must be true or false.'
      };
    }
  },
  trueValues: {
    default: function () {
      return [true];
    }
  },
  falseValues: {
    default: function () {
      return [false];
    }
  },
  validate: function (value) {
    if (this.allowEmpty && this.isEmpty(value)) {
      return true;
    }
    else if (~this.trueValues.indexOf(value)) {
      return true;
    }
    else if (~this.falseValues.indexOf(value)) {
      return true;
    }
    else {
      return this.message;
    }
  }
};