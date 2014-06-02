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