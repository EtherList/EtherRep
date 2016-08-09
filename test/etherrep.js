contract('EtherRep', function(accounts) {
  let rep;
  beforeEach(function() {
    rep = EtherRep.deployed();
  });

  it('defaults to zero reputation', function() {
    return rep.getReputation.call(accounts[0]).then(reputation => {
      assert.equal(reputation.valueOf(), 0, "default reputation wasn't 0");
    });
  });

  it('defaults to zero ratings', function() {
    return rep.getNumRatings.call(accounts[0])
      .then(numRatings => {
        assert.equal(numRatings.valueOf(), 0, "defualt number of ratings wasn't 0");
      });
  });

  it('gets the number of ratings', function() {
    return rep.increaseRep(accounts[0])
      .then(() => rep.decreaseRep(accounts[0])
        .then(rep.getNumRatings.call.bind(rep, accounts[0]))
        .then(numRatings => {
          assert.equal(numRatings.valueOf(), 2, 'number of ratings should be 2')
        }));
  });

  it('increases reputation', function() {
    return rep.getReputation.call(accounts[0])
      .then(curReputation => {
        rep.increaseRep(accounts[0])
          .then(rep.getReputation.call.bind(rep, accounts[0]))
          .then(newReputation => assert.equal(newReputation.valueOf(), curReputation + 10, 'did not increase reputation'));
      });
  });

  it('decreases reputation by 10', function() {
    return rep.getReputation.call(accounts[0])
      .then(curReputation => {
        curReputation = 30;
        rep.decreaseRep(accounts[0])
          .then(rep.getReputation.call.bind(rep, accounts[0]))
          .then(newReputation => assert.equal(newReputation.valueOf(), 10, 'did not decrease reputation by 10'));
      });
  });

  it('decreases reputation by percentage', function() {
    return rep.getReputation.call(accounts[0])
      .then(curReputation => {
        curReputation = 500;
        rep.decreaseRep(accounts[0])
          .then(rep.getReputation.call.bind(rep, accounts[0]))
          .then(newReputation => assert.equal(newReputation.valueOf(), 450, 'did not decrease reputation by percentage'));
      });
  });
});
