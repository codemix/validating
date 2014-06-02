"use strict";

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
      return {
        default: 'Invalid value.'
      };
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
  allowEmpty: {
    value: false
  },
  /**
   * Determine whether the given value is empty.
   *
   * @param  {mixed}  value  The value to examine.
   * @return {Boolean}       true if the value is empty, otherwise false.
   */
  isEmpty: function (value) {
    if (value == null || value === '') {
      return true;
    }
    else if (Array.isArray(value) && value.length === 0) {
      return true;
    }
    else if (typeof value === 'object' && Object.keys(value).length === 0) {
      return true;
    }
    else {
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