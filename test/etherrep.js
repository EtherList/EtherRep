const utils = require('./utils');

contract('EtherRep', function(accounts) {
  let rep;
  let zero  = accounts[0];
  let alice = accounts[1];
  let factory = accounts[2];

  let getAliceRep = () => rep.reputation.call(alice);
  let increaseAliceRep = (points) => () => rep.increaseReputation(alice, points, {from: factory});
  let decreaseAliceRep = (points) => () => rep.decreaseReputation(alice, points, {from: factory});
  let setFactoryPerms = (maxInc, maxDec) => () => rep.setPermissionLimits(factory, maxInc, maxDec, {from: zero});
  let getFactoryMaxInc = () => rep.maxIncrement.call(factory);
  let assertValueOf = (expected) => (bigInt) => assert.equal(bigInt.valueOf(), expected);

  beforeEach(function() {
    rep = EtherRep.deployed();

    return setFactoryPerms(1000, 1000)()
    .then(decreaseAliceRep(1000))
    .then(setFactoryPerms(0, 0));
  });

  it('allows the owner to set permissions', function() {
    return setFactoryPerms(10, 5)()
    .then(getFactoryMaxInc)
    .then(assertValueOf(10));
  });

  it('does not allow others to set permissions', function() {
    return rep.setPermissionLimits(factory, 10, 5, {from: alice})
    .then(getFactoryMaxInc)
    .then(assertValueOf(0));
  });

  it('increases reputation when allowed', function() {
    return setFactoryPerms(10, 5)()
    .then(increaseAliceRep(10))
    .then(getAliceRep)
    .then(assertValueOf(10));
  });

  it('does not increase reputation more than allowed', function() {
    return setFactoryPerms(10, 5)()
    .then(increaseAliceRep(11))
    .then(getAliceRep)
    .then(assertValueOf(10));
  });

  it('does not increase reputation when not allowed because factory is not approved', function() {
    return rep.increaseReputation(alice, 10, {from: accounts[4]})
    .then(getAliceRep)
    .then(assertValueOf(0));
  });

  it('does not increase reputation by negative numbers', function() {
    // negative numbers become huge positive numbers, which are capped
    return setFactoryPerms(10, 5)()
    .then(increaseAliceRep(10))
    .then(increaseAliceRep(-5))
    .then(getAliceRep)
    .then(assertValueOf(20));
  });

  it('accepts strings gracefully', function() {
    return setFactoryPerms(10, 5)()
    .then(increaseAliceRep(10))
    .then(increaseAliceRep('5'))
    .then(getAliceRep)
    .then(assertValueOf(15));
  });

  it('decreases reputation when allowed', function() {
    return setFactoryPerms(10, 5)()
    .then(increaseAliceRep(10))
    .then(decreaseAliceRep(5))
    .then(getAliceRep)
    .then(assertValueOf(5));
  });

  it('does not decrease reputation more than allowed', function() {
    return setFactoryPerms(10, 5)()
    .then(increaseAliceRep(10))
    .then(decreaseAliceRep(6))
    .then(getAliceRep)
    .then(assertValueOf(5));
  });

  it('does not decrease reputation when not allowed because factory is not approved', function() {
    return rep.decreaseReputation(alice, 10, {from: accounts[4]})
    .then(getAliceRep)
    .then(assertValueOf(0));
  });

});
