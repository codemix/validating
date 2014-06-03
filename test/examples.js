var expect = require('expect.js');

var Validating = require('../lib'),
    Class = require('classing');

describe('examples', function () {
  describe('Create a function which can validate objects', function () {
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


    var validateUser = Validating.forDescriptors(userDescriptors);

    it('should fail on invalid input', function () {
      var result = validateUser({
        name: null,
        email: 'not a valid email address...'
      });

      result.valid.should.be.false;
      result.errors.should.have.properties({
        name: 'Cannot be empty.',
        email: 'Not a valid email address.'
      });
    });

    it('should accept valid input', function () {
      var result = validateUser({
        name: 'Admin',
        email: 'admin@example.com'
      });

      result.valid.should.be.true;
      result.errors.should.eql({});
    });
  });
});