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
 * @type {Validator}
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
 * @type {Validator}
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
                tooShortString: 'Too short, should be at least {{length}} character(s).',
                tooLongString: 'Too long, should be at most {{length}} character(s).',
                tooShortArray: 'Too short, should contain at least {{length}} item(s).',
                tooLongArray: 'Too long, should contain at most {{length}} item(s).',
                tooShortObject: 'Too short, should contain at least {{length}} key(s).',
                tooLongObject: 'Too long, should contain at most {{length}} key(s).'
            };
        }
    },
    min: {},
    max: {},
    validate: function (value) {
        OBLIGATIONS.precondition(this.min || this.max, 'No constraints specified for length validator.');
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        } else if (typeof value === 'string') {
            return this.validateString(value);
        } else if (Array.isArray(value)) {
            return this.validateArray(value);
        } else if (value && typeof value === 'object') {
            return this.validateObject(value);
        } else {
            return this.messages.invalid;    // invalid type
        }
    },
    validateString: function (value) {
        OBLIGATIONS.precondition(typeof value === 'string', 'Value must be a string.');
        if (this.min && value.length < this.min) {
            return this.prepare(this.messages.tooShortString, { length: this.min });
        } else if (this.max && value.length > this.max) {
            return this.prepare(this.messages.tooLongString, { length: this.max });
        } else {
            return true;
        }
    },
    validateArray: function (value) {
        OBLIGATIONS.precondition(Array.isArray(value), 'Value must be an array.');
        if (this.min && value.length < this.min) {
            return this.prepare(this.messages.tooShortArray, { length: this.min });
        } else if (this.max && value.length > this.max) {
            return this.prepare(this.messages.tooLongArray, { length: this.max });
        } else {
            return true;
        }
    },
    validateObject: function (value) {
        OBLIGATIONS.precondition(value && typeof value === 'object', 'Value must be an object.');
        var keys = Object.keys(value);
        if (this.min && keys.length < this.min) {
            return this.prepare(this.messages.tooShortObject, { length: this.min });
        } else if (this.max && keys.length > this.max) {
            return this.prepare(this.messages.tooLongObject, { length: this.max });
        } else {
            return true;
        }
    }
};