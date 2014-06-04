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


  it('should reject NaN values', function () {
    validator.validate(NaN).should.equal('Expected a number.');
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


describe('validators.range', function () {
  describe('in', function () {
    var validator = Validating.create('range', {
      allowEmpty: true,
      in: [1, 2, 3, 4, "foo"]
    });

    it('should allow empty values', function () {
      validator.validate(null).should.be.true;
    });

    it('should reject values outside the range', function () {
      validator.validate(5).should.equal('Not in the list of valid options.');
      validator.validate("1").should.equal('Not in the list of valid options.');
      validator.validate("bar").should.equal('Not in the list of valid options.');
    });

    it('should accept values within the range', function () {
      validator.validate(1).should.be.true;
      validator.validate(3).should.be.true;
      validator.validate("foo").should.be.true;
    });
  });

  describe('between numbers', function () {
    var validator = Validating.create('range', {
      allowEmpty: true,
      between: [5, 10]
    });

    it('should allow empty values', function () {
      validator.validate(null).should.be.true;
    });

    it('should reject values outside the range', function () {
      validator.validate('a').should.equal('Must be between 5 and 10.');
      validator.validate(4).should.equal('Must be between 5 and 10.');
      validator.validate(11).should.equal('Must be between 5 and 10.');
    });

    it('should accept values within the range', function () {
      validator.validate(5).should.be.true;
      validator.validate(7).should.be.true;
      validator.validate(10).should.be.true;
    });
  });

  describe('between strings', function () {
    var validator = Validating.create('range', {
      allowEmpty: true,
      between: ["a", "z"]
    });

    it('should allow empty values', function () {
      validator.validate(null).should.be.true;
    });

    it('should reject values outside the range', function () {
      validator.validate('A').should.equal('Must be between a and z.');
      validator.validate('Z').should.equal('Must be between a and z.');
      validator.validate('&').should.equal('Must be between a and z.');
    });

    it('should accept values within the range', function () {
      validator.validate('a').should.be.true;
      validator.validate('g').should.be.true;
      validator.validate('z').should.be.true;
    });
  });


  describe('between dates', function () {
    var validator = Validating.create('range', {
      allowEmpty: true,
      between: [new Date(2010, 10, 24), new Date(2012, 8, 13)]
    });

    it('should allow empty values', function () {
      validator.validate(null).should.be.true;
    });

    it('should reject values outside the range', function () {
      validator.validate('foo').should.not.be.true;
      validator.validate(new Date(2014, 5, 1)).should.not.be.true;
      validator.validate(new Date(1984, 9, 1)).should.not.be.true;
    });

    it('should accept values within the range', function () {
      validator.validate(new Date(2010, 10, 24)).should.be.true;
      validator.validate(new Date(2011, 7, 7)).should.be.true;
      validator.validate(new Date(2012, 8, 13)).should.be.true;
    });
  });

});



describe('validators.ip', function () {
  var validator = Validating.create('ip');

  it('should allow empty values', function () {
    validator.allowEmpty = true;
    validator.validate(null).should.be.true;
    validator.allowEmpty = false;
  });

  it('should reject invalid IP addresses', function () {
    validator.validate('nope').should.equal('Not a valid IP address.');
    validator.validate('256.256.256.000').should.equal('Not a valid IP address.');
  });

  it('should accept valid IPv4 addresses', function () {
    validator.validate('127.0.0.1').should.be.true;
    validator.validate('255.0.1.1').should.be.true;
    validator.validate('196.168.0.1').should.be.true;
  });

  it('should accept valid IPv6 addresses', function () {
    validator.validate('2001:0db8:85a3:0000:0000:8a2e:0370:7334').should.be.true;
    validator.validate('2001:db8:85a3:0:0:8a2e:370:7334').should.be.true;
    validator.validate('2001:db8:85a3::8a2e:370:7334').should.be.true;
  });
});


describe('validators.hostname', function () {
  var validator = Validating.create('hostname');

  it('should allow empty values', function () {
    validator.allowEmpty = true;
    validator.validate(null).should.be.true;
    validator.allowEmpty = false;
  });

  it('should reject invalid hostnames', function () {
    validator.validate('nope not valid').should.equal('Not a valid hostname.');
    validator.validate('not_a_valid_hostname.com').should.equal('Not a valid hostname.');
    validator.validate('-not-valid-.com').should.equal('Not a valid hostname.');
  });

  it('should accept valid hostnames', function () {
    validator.validate('example.com').should.be.true;
    validator.validate('test-example.com').should.be.true;
    validator.validate('codemix.co.uk').should.be.true;
  });

});

describe('validators.date', function () {
  var validator = Validating.create('date');

  it('should allow empty values', function () {
    validator.allowEmpty = true;
    validator.validate(null).should.be.true;
    validator.allowEmpty = false;
  });

  it('should reject invalid dates', function () {
    validator.validate('nope not valid').should.equal('Not a valid date.');
    validator.validate('2013-99-99').should.equal('Not a valid date.');
    validator.validate('2013-03-03 123').should.equal('Not a valid date.');
  });

  it('should accept valid dates', function () {
    validator.validate('1984-09-01').should.be.true;
    validator.validate('1981-07-01').should.be.true;
    validator.validate('2014-02-28').should.be.true;
    validator.validate(new Date()).should.be.true;
  });

});

describe('validators.time', function () {
  var validator = Validating.create('time');

  it('should allow empty values', function () {
    validator.allowEmpty = true;
    validator.validate(null).should.be.true;
    validator.allowEmpty = false;
  });

  it('should reject invalid time', function () {
    validator.validate('nope not valid').should.equal('Not a valid time.');
    validator.validate('25:00:11').should.equal('Not a valid time.');
    validator.validate('00:61:00').should.equal('Not a valid time.');
    validator.validate('00:00:60').should.equal('Not a valid time.');
  });

  it('should accept valid time', function () {
    validator.validate('00:00:00').should.be.true;
    validator.validate('12:00:02').should.be.true;
    validator.validate('15:00:12').should.be.true;
    validator.validate(new Date()).should.be.true;
  });

});


describe('validators.datetime', function () {
  var validator = Validating.create('datetime');

  it('should allow empty values', function () {
    validator.allowEmpty = true;
    validator.validate(null).should.be.true;
    validator.allowEmpty = false;
  });

  it('should reject invalid datetime', function () {
    validator.validate('nope not valid').should.equal('Not a valid date / time.');
    validator.validate('2009-01-01 25:00:11').should.equal('Not a valid date / time.');
    validator.validate('2000-99-01 00:26:00').should.equal('Not a valid date / time.');
    validator.validate('2000-01-01W00:00:30').should.equal('Not a valid date / time.');
  });

  it('should accept valid datetime', function () {
    validator.validate('2009-09-09 00:00:00').should.be.true;
    validator.validate('2012-12-12 12:00:02').should.be.true;
    validator.validate('2001-01-01T15:00:12Z').should.be.true;
    validator.validate('2001-01-01T15:00:12.123Z').should.be.true;
    validator.validate(new Date()).should.be.true;
  });

});

