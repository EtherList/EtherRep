contract('EtherRep', function(accounts) {
  let rep;
  beforeEach(function() {
    rep = EtherRep.deployed();
  });

  it('defaults to zero reputation', function() {
    return rep.getRating.call(accounts[0]).then(rating => {
      assert.equal(rating.valueOf(), 0, "default rating wasn't 0");
    });
  });

  it('accepts new ratings', function() {
    return rep.rateUser(accounts[0], 5)
      .then(rep.getRating.call.bind(rep, accounts[0]))
      .then(rating => assert.equal(rating.valueOf(), 5));
  });

  it('averages ratings', function() {
    return rep.rateUser(accounts[0], 0)
      .then(rep.rateUser.bind(rep, accounts[0], 10))
      .then(rep.getRating.call.bind(rep, accounts[0]))
      .then(rating => assert.equal(rating.valueOf(), 5));
  });
});
