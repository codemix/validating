# Validating

[![Build Status](https://travis-ci.org/codemix/validating.svg?branch=master)](https://travis-ci.org/codemix/validating)


# Installation

Via [npm](https://npmjs.org/package/validating):

    npm install --save validating


or [bower](http://bower.io/search/?q=validating):


    bower install --save validating


# Usage


### Create a function which can validate objects

```js
var validating = require('validating');

var userDescriptors = {
  name: {
    rules: [
      ['required'],
      ['regexp', {pattern: /^[A-Za-z][A-Za-z0-9]*$/}]
    ]
  },
  email: {
    rules: [
      {name: 'email'},
      {name: 'required'}
    ]
  }
};


var validateUser = validating.forDescriptors(userDescriptors);

var result = validateUser({
  name: null,
  email: 'not a valid email address...'
});

console.log(result.valid);
console.log(result.errors);

```



# Running the tests

First, `npm install`, then `npm test`. Code coverage generated with `npm run coverage`.


# License

MIT, see [LICENSE.md](LICENSE.md).

