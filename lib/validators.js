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
            return this.prepare(this.message);
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
            return this.prepare(this.messages.invalid);    // invalid type
        }
    },
    validateString: function (value) {
        OBLIGATIONS.precondition(typeof value === 'string', 'Value must be a string.');
        if (this.min && value.length < this.min) {
            return this.prepare(this.messages.tooShortString);
        } else if (this.max && value.length > this.max) {
            return this.prepare(this.messages.tooLongString);
        } else {
            return true;
        }
    },
    validateArray: function (value) {
        OBLIGATIONS.precondition(Array.isArray(value), 'Value must be an array.');
        if (this.min && value.length < this.min) {
            return this.prepare(this.messages.tooShortArray);
        } else if (this.max && value.length > this.max) {
            return this.prepare(this.messages.tooLongArray);
        } else {
            return true;
        }
    },
    validateObject: function (value) {
        OBLIGATIONS.precondition(value && typeof value === 'object', 'Value must be an object.');
        var keys = Object.keys(value);
        if (this.min && keys.length < this.min) {
            return this.prepare(this.messages.tooShortObject);
        } else if (this.max && keys.length > this.max) {
            return this.prepare(this.messages.tooLongObject);
        } else {
            return true;
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
                invalid: 'Expected a number.',
                tooSmall: 'Must be at least {{min}}.',
                tooLarge: 'Must be at most {{max}}.'
            };
        }
    },
    min: {},
    max: {},
    validate: function (value) {
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        } else if (typeof value !== 'number' || isNaN(value)) {
            return this.prepare(this.messages.invalid);
        } else if (this.min && value < this.min) {
            return this.prepare(this.messages.tooSmall);
        } else if (this.max && value > this.max) {
            return this.prepare(this.messages.tooLarge);
        } else {
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
            return { default: 'Must be true or false.' };
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
        } else if (~this.trueValues.indexOf(value)) {
            return true;
        } else if (~this.falseValues.indexOf(value)) {
            return true;
        } else {
            return this.prepare(this.message);
        }
    }
};
/**
 * # Regular Expression Validator
 *
 * Ensures that the given value matches the specified pattern.
 *
 * @type {Validator}
 */
exports.regexp = {
    messages: {
        default: function () {
            return {
                default: 'Does not match the required pattern.',
                badType: 'Should be a text value.'
            };
        }
    },
    pattern: {
        get: function () {
            return this._pattern || new RegExp();
        },
        set: function (value) {
            if (typeof value === 'string') {
                value = new RegExp(value);
            }
            this._pattern = value;
        }
    },
    validate: function (value) {
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        } else if (typeof value !== 'string') {
            return this.prepare(this.messages.badType);
        } else if (this.pattern.test(value)) {
            return true;
        } else {
            return this.prepare(this.message);
        }
    }
};
/**
 * # Range Validator.
 *
 * Asserts that the given value is either *between* 2 values (inclusive), or
 * *in* a list of acceptable values.
 *
 * @type {Validator}
 */
exports.range = {
    messages: {
        default: function () {
            return {
                between: 'Must be between {{start}} and {{stop}}.',
                in: 'Not in the list of valid options.'
            };
        }
    },
    in: {},
    between: {},
    validate: function (value) {
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        } else if (this.between) {
            return this.validateBetween(value);
        } else if (this.in) {
            return this.validateIn(value);
        } else {
            return true;
        }
    },
    validateBetween: function (value) {
        OBLIGATIONS.precondition(Array.isArray(this.between) && this.between.length === 2, '`between` must be an array containing two values.');
        if (value >= this.between[0] && value <= this.between[1]) {
            return true;
        } else {
            return this.prepare(this.messages.between, {
                start: this.between[0],
                stop: this.between[1]
            });
        }
    },
    validateIn: function (value) {
        OBLIGATIONS.precondition(Array.isArray(this.in), '`in` must be an array');
        if (~this.in.indexOf(value)) {
            return true;
        } else {
            return this.prepare(this.messages.in);
        }
    }
};
/**
 * # URL Validator
 *
 * Ensures that the given value is a URL.
 *
 * @type {Validator}
 */
exports.url = {
    messages: {
        default: function () {
            return { default: 'Not a valid URL.' };
        }
    },
    schemes: {
        default: function () {
            return [
                'http',
                'https'
            ];
        }
    },
    strict: { value: true },
    pattern: {
        get: function () {
            if (!this._pattern) {
                this._pattern = this.createPattern();
            }
            return this._pattern;
        },
        set: function (value) {
            if (typeof value === 'string') {
                value = new RegExp(value, 'i');
            }
            this._pattern = value;
        }
    },
    createPattern: function () {
        var pattern = '^(({schemes}):\\/\\/)?(([A-Z0-9][A-Z0-9_-]*)(\\.[A-Z0-9][A-Z0-9_-]*)+)'.replace('{schemes}', this.schemes.join('|'));
        return new RegExp(pattern, 'i');
    },
    validate: function (value) {
        var matches;
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        } else if (!(matches = this.pattern.exec(value))) {
            return this.prepare(this.message);
        }
        if (this.strict && !matches[1]) {
            return this.prepare(this.message);
        } else {
            return true;
        }
    }
};
/**
 * # Email Address Validator
 *
 * Ensures that the given value is a valid email address.
 *
 * > Note: The only really viable way of testing whether an email address is valid
 * > is to send an email to it. This validator uses a very simple and permissive pattern by default.
 *
 * @type {Validator}
 */
exports.email = {
    messages: {
        default: function () {
            return { default: 'Not a valid email address.' };
        }
    },
    pattern: { value: /@(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)$/i },
    validate: function (value) {
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        } else if (this.pattern.test(value)) {
            return true;
        } else {
            return this.prepare(this.message);
        }
    }
};
/**
 * # IP Address Validator.
 *
 * Ensures that the given value is a valid IPv4 or IPv6 address.
 *
 * @type {Validator}
 */
exports.ip = {
    messages: {
        default: function () {
            return { default: 'Not a valid IP address.' };
        }
    },
    v4: { value: true },
    v6: { value: true },
    patterns: {
        default: function () {
            return {
                v4: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                // jshint ignore: line
                v6: /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/    // jshint ignore: line
            };
        }
    },
    validate: function (value) {
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        } else if (this.v4 && this.patterns.v4.test(value)) {
            return true;
        } else if (this.v6 && this.patterns.v6.test(value)) {
            return true;
        } else {
            return this.prepare(this.message);
        }
    }
};
/**
 * # Hostname Validator.
 *
 * Ensures that the given value is a valid hostname.
 *
 * @type {Validator}
 */
exports.hostname = {
    messages: {
        default: function () {
            return { default: 'Not a valid hostname.' };
        }
    },
    pattern: {
        value: /^(?:(?:(?:(?:[a-zA-Z0-9][-a-zA-Z0-9]{0,61})?[a-zA-Z0-9])[.])*(?:[a-zA-Z][-a-zA-Z0-9]{0,61}[a-zA-Z0-9]|[a-zA-Z])[.]?)$/    // jshint ignore: line
    },
    validate: function (value) {
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        }
        value = '' + value;
        if (value.length > 0 && value.length <= 255 && this.pattern.test(value)) {
            return true;
        } else {
            return this.prepare(this.message);
        }
    }
};
/**
 * # Date Validator
 *
 * Ensures that the given value is a valid date.
 *
 * @type {Validator}
 */
exports.date = {
    messages: {
        default: function () {
            return { default: 'Not a valid date.' };
        }
    },
    pattern: { value: /^(\d{4})-(\d{2})-(\d{2})$/ },
    validate: function (value) {
        var matches;
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        }
        if (value instanceof Date) {
            return true;
        }
        if (matches = this.pattern.exec(value)) {
            if (+matches[2] < 13 && +matches[3] < 32) {
                return true;
            }
        }
        return this.prepare(this.message);
    }
};
/**
 * # Time Validator
 *
 * Ensures that the given value is a valid time.
 *
 * @type {Validator}
 */
exports.time = {
    messages: {
        default: function () {
            return { default: 'Not a valid time.' };
        }
    },
    pattern: { value: /^(\d{2}):(\d{2}):(\d{2})$/ },
    validate: function (value) {
        var matches;
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        }
        if (value instanceof Date) {
            return true;
        }
        if (matches = this.pattern.exec(value)) {
            if (+matches[1] < 24 && +matches[2] < 60 && +matches[3] < 60) {
                return true;
            }
        }
        return this.prepare(this.message);
    }
};
/**
 * # Date / Time Validator
 *
 * Ensures that the given value is a valid date / time.
 *
 * @type {Validator}
 */
exports.datetime = {
    messages: {
        default: function () {
            return { default: 'Not a valid date / time.' };
        }
    },
    pattern: { value: /^(\d{4})-(\d{2})-(\d{2})[\s|T]?(\d{2}):(\d{2}):(\d{2})(?:.\d{1,3})?Z?$/ },
    validate: function (value) {
        var matches;
        if (this.allowEmpty && this.isEmpty(value)) {
            return true;
        } else if (value instanceof Date) {
            return true;
        } else if (matches = this.pattern.exec(value)) {
            if (+matches[2] < 13 && // month
                +matches[3] < 32 && // day
                +matches[4] < 24 && // hours
                +matches[5] < 60 && // minutes
                +matches[6] < 60) {
                return true;
            }
        }
        return this.prepare(this.message);
    }
};