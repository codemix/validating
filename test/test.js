var expect = require('expect.js');

var Validating = require('../lib'),
    Class = require('classing');

describe('Validating', function () {

  it('should create the builtin validators', function () {
    expect(Validating.validators).to.have.property('required');
    expect(Validating.validators).to.have.property('type');
    expect(Validating.validators).to.have.property('instanceOf');
  });

  it('should create a validator instance', function () {
    var validator = Validating.create('required');
    validator.should.be.an.instanceOf(Validating.Validator);
  });

  it('should create a validator, with some options', function () {
    var validator = Validating.create('required', {
      message: 'Required!'
    });
    validator.should.be.an.instanceOf(Validating.Validator);
    validator.message.should.equal('Required!');
  });


  describe('Validating.forDescriptors()', function () {
    var User = Class.create({
      name: {
        rules: [
          {name: 'required'},
          ['type', {type: 'string'}]
        ]
      },
      email: {
        rules: [
          {name: 'type', type: 'string'}
        ]
      }
    });
    var validate = Validating.forDescriptors(User.descriptors);

    it('should validate valid values', function () {
      var result = validate({
        name: 'Hello World',
        email: 'test@test.com'
      });
      result.valid.should.be.true;
      result.errors.should.eql({});
    });

    it('should fail on invalid values', function () {
      var result = validate({
        email: 'test@test.com'
      });
      result.valid.should.be.false;
      result.errors.should.eql({
        name: 'Cannot be empty.'
      });
    });

    it('should return multiple error messages', function () {
      var result = validate({
        name: false,
        email: {}
      });
      result.valid.should.be.false;
      result.errors.should.eql({
        name: 'Expected string, got boolean.',
        email: 'Expected string, got object.'
      });
    });

  });
});

describe('validators.required', function () {
  var validator = Validating.create('required');

  it('should not allow null values', function () {
    validator.validate(null).should.equal('Cannot be empty.');
  });
  it('should not allow undefined values', function () {
    validator.validate(null).should.equal('Cannot be empty.');
  });
  it('should not allow empty string values', function () {
    validator.validate('').should.equal('Cannot be empty.');
  });
  it('should not allow empty array values', function () {
    validator.validate([]).should.equal('Cannot be empty.');
  });
  it('should not allow empty object', function () {
    validator.validate({}).should.equal('Cannot be empty.');
  });
  it('should not allow empty object, without prototypes', function () {
    validator.validate(Object.create(null)).should.equal('Cannot be empty.');
  });

  it('should allow booleans', function () {
    validator.validate(true).should.be.true;
    validator.validate(false).should.be.true;
  });
  it('should allow strings', function () {
    validator.validate('hello world').should.be.true;
  });
  it('should allow numbers', function () {
    validator.validate(0).should.be.true;
    validator.validate(100).should.be.true;
    validator.validate(-1).should.be.true;
    validator.validate(Infinity).should.be.true;
  });

  it('should allow arrays', function () {
    validator.validate([1, 2 ,3]).should.be.true;
  });

  it('should allow objects', function () {
    validator.validate({greeting: 'hello world'}).should.be.true;
  });
});

describe('validators.type', function () {
  var validator = Validating.create('type', {
    type: 'string'
  });

  it('should allow empty values', function () {
    validator.allowEmpty = true;
    validator.validate(null).should.be.true;
    validator.allowEmpty = false;
  });

  it('should validate strings', function () {
    validator.validate('hello world').should.be.true;
    validator.validate('').should.be.true;
    validator.validate(123).should.equal('Expected string, got number.');
  });

  it('should validate null values', function () {
    validator.type = 'null';
    validator.validate(null).should.be.true;
    validator.validate(undefined).should.equal('Expected null, got undefined.');
    validator.validate(123).should.equal('Expected null, got number.');
  });

  it('should validate boolean values', function () {
    validator.type = 'boolean';
    validator.validate(true).should.be.true;
    validator.validate(false).should.be.true;
    validator.validate(undefined).should.equal('Expected boolean, got undefined.');
    validator.validate(123).should.equal('Expected boolean, got number.');
  });

  it('should validate function values', function () {
    validator.type = 'function';
    validator.validate(function () {}).should.be.true;
    validator.validate(undefined).should.equal('Expected function, got undefined.');
    validator.validate(123).should.equal('Expected function, got number.');
  });

  it('should validate numerical values', function () {
    validator.type = 'number';
    validator.validate(1).should.be.true;
    validator.validate(-1).should.be.true;
    validator.validate(1.234).should.be.true;
    validator.validate("123").should.equal('Expected number, got string.');
    validator.validate(undefined).should.equal('Expected number, got undefined.');
  });
});


describe('validators.instanceOf', function () {
  var User = Class.create('User', {
    name: {},
    email: {}
  });
  var Thing = Class.create('Thing');

  var validator = Validating.create('instanceOf', {
    class: User
  });

  it('should allow / disallow empty values', function () {
    validator.allowEmpty = true;
    validator.validate(null).should.be.true;
    validator.allowEmpty = false;
    validator.validate(null).should.equal('Expected User, got null.');
  });

  it('should validate class instances', function () {
    var user = new User({name: 'bob'}),
        thing = new Thing();
    validator.validate(user).should.be.true;
    validator.validate(thing).should.equal('Expected User, got Thing.');
    validator.validate({}).should.equal('Expected User, got Object.');
  });

  it('should validate class names', function () {
    var user = new User({name: 'bob'}),
        thing = new Thing();

    validator.class = 'User';

    validator.validate(user).should.be.true;
    validator.validate(thing).should.equal('Expected User, got Thing.');
    validator.validate({}).should.equal('Expected User, got Object.');
  });
});


describe('validators.length', function () {
  var validator = Validating.create('length', {
    allowEmpty: true,
    min: 3,
    max: 6
  });


  it('should allow empty values', function () {
    validator.validate('').should.be.true;
    validator.validate([]).should.be.true;
    validator.validate({}).should.be.true;
  });

  it('should validate string lengths', function () {
    validator.validate('a').should.equal('Too short, should be at least 3 character(s).');
    validator.validate('abcdefg').should.equal('Too long, should be at most 6 character(s).');
    validator.validate('abc').should.be.true;
    validator.validate('abcdef').should.be.true;
    validator.validate('abcd').should.be.true;
  });

  it('should validate array lengths', function () {
    validator.validate([1]).should.equal('Too short, should contain at least 3 item(s).');
    validator.validate([1,2,3,4,5,6,7]).should.equal('Too long, should contain at most 6 item(s).');
    validator.validate([1,2,3]).should.be.true;
    validator.validate([1,2,3,4]).should.be.true;
    validator.validate([1,2,3,4,5,6]).should.be.true;
  });

  it('should validate object lengths', function () {
    validator.validate({a:1}).should.equal('Too short, should contain at least 3 key(s).');
    validator.validate({a:1,b:2,c:3,d:4,e:5,f:6,g:7}).should.equal('Too long, should contain at most 6 key(s).');
    validator.validate({a:1,b:2,c:3}).should.be.true;
    validator.validate({a:1,b:2,c:3,d:4}).should.be.true;
    validator.validate({a:1,b:2,c:3,d:4,e:5,f:6}).should.be.true;
  });
});

describe('validators.number', function () {
  var validator = Validating.create('number', {
    allowEmpty: true,
    min: 3,
    max: 10
  });


  it('should allow empty values', function () {
    validator.validate(null).should.be.true;
  });

  it('should reject invalid values', function () {
    validator.validate('nope').should.equal('Expected a number.');
  });

  it('should reject values which are too small', function () {
    validator.validate(1).should.equal('Must be at least 3.');
  });

  it('should reject values which are too large', function () {
    validator.validate(11).should.equal('Must be at most 10.');
  });

  it('should accept valid values', function () {
    validator.validate(3).should.be.true;
    validator.validate(5).should.be.true;
    validator.validate(10).should.be.true;
  });
});

describe('validators.boolean', function () {
  var validator = Validating.create('boolean', {
    allowEmpty: true,
    trueValues: [true, 1, '1', 'true'],
    falseValues: [false, 0, '0', 'false']
  });

  it('should allow empty values', function () {
    validator.validate(null).should.be.true;
  });

  it('should reject invalid values', function () {
    validator.validate('nope').should.equal('Must be true or false.');
    validator.validate({a: 'nope'}).should.equal('Must be true or false.');
  });

  it('should accept true values', function () {
    validator.validate(true).should.be.true;
    validator.validate(1).should.be.true;
    validator.validate('1').should.be.true;
    validator.validate('true').should.be.true;
  });

  it('should accept false values', function () {
    validator.validate(false).should.be.true;
    validator.validate(0).should.be.true;
    validator.validate('0').should.be.true;
    validator.validate('false').should.be.true;
  });

});

describe('validators.regexp', function () {
  var validator = Validating.create('regexp', {
    pattern: '^([A-Z][A-Za-z0-9]*)$'
  });

  it('should allow empty values', function () {
    validator.allowEmpty = true;
    validator.validate(null).should.be.true;
    validator.allowEmpty = false;
  });

  it('should reject arrays, objects etc', function () {
    validator.validate([1, 2, 3]).should.equal('Should be a text value.');
    validator.validate({a: 1}).should.equal('Should be a text value.');
  });

  it('should reject strings which do not match', function () {
    validator.validate('nope').should.equal('Does not match the required pattern.');
    validator.validate('Nope Nope Nope').should.equal('Does not match the required pattern.');
  });

  it('should allow values which match', function () {
    validator.validate('Hello').should.be.true;
    validator.validate('World').should.be.true;
  });

});

describe('validators.url', function () {
  var validator = Validating.create('url');

  it('should allow empty values', function () {
    validator.allowEmpty = true;
    validator.validate(null).should.be.true;
    validator.allowEmpty = false;
  });

  it('should reject invalid urls', function () {
    validator.validate('not a url.').should.equal('Not a valid URL.');
  });

  it('should reject urls with the wrong scheme', function () {
    validator.validate('ftp://example.com/wat.').should.equal('Not a valid URL.');
  });

  it('should reject urls with the wrong scheme', function () {
    validator.validate('ftp://example.com/wat.').should.equal('Not a valid URL.');
  });

  it('should reject urls without schemes by default', function () {
    validator.validate('example.com/wat.').should.equal('Not a valid URL.');
  });

  it('should accept urls with schemes', function () {
    validator.validate('http://example.com/wat').should.be.true;
  });

  it('should accept urls without schemes when not in strict mode', function () {
    validator.strict = false;
    validator.validate('example.com/wat').should.be.true;
    validator.strict = true;
  });
});

describe('validators.email', function () {
  var validator = Validating.create('email');

  it('should reject invalid email addresses', function () {
    validator.validate('nope').should.equal('Not a valid email address.');
    validator.validate('nope@nope').should.equal('Not a valid email address.');
  });

  it('should accept valid email addresses', function () {
    validator.validate('test@example.com').should.be.true;
    validator.validate('test+thisisathing@example.com').should.be.true;
    validator.validate('test+"this is a thing"@example.com').should.be.true;
  });
});