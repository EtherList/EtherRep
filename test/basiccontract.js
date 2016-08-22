contract('BasicContract', function(accounts) {
  let elist;
  let bc;
  let filter;
  let zero = accounts[0];
  let alice = accounts[1];
  let bob   = accounts[2];
  let contractAddr = null;

  const Satisfaction = {
    NotYetResponded: 0,
    Unsatisfied: 1,
    Satisfied: 2
  };

  let markSatisfied = (who) => () => bc.markCompleted(Satisfaction.Satisfied, {from: who});
  let markUnsatisfied = (who) => () => bc.markCompleted(Satisfaction.Unsatisfied, {from: who});
  let assertValueOf = (expected) => (bigInt) => assert.equal(bigInt.valueOf(), expected);

  function assertCompleted(expected) {
    return bc.isCompleted.call()
    .then(assertValueOf(expected));
  }

  before(function() {
    return EtherList.new(EtherRep.deployed().address)
    .then(elistAddr => {
      elist = elistAddr;
      filter = elist.CreateContract({});
      filter.watch((error, log) => {
        if (error) {
          console.error('err=', error);
        } else {
          contractAddr = log.args.newContractAddr;
        }
      });
    });
  });

  beforeEach(function() {
    contractAddr = null;
    elist.createContract(alice, bob);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        bc = BasicContract.at(contractAddr);
        resolve(null)
      }, 1000);
    })
  });

  after(function() {
    filter.stopWatching();
  });

  it('completes successfully when both parties are satisfied', function() {
    return markSatisfied(alice)()
    .then(markSatisfied(bob))
    .then(assertCompleted(Satisfaction.Satisfied));
  });

  it('completes unsuccessfully if a party marks it so', function() {
    return markSatisfied(alice)()
    .then(markUnsatisfied(bob))
    .then(assertCompleted(Satisfaction.Unsatisfied));
  });

  it('is not completed if one party tries to complete it twice', function() {
    return markSatisfied(alice)()
    .then(markSatisfied(alice))
    .then(assertCompleted(Satisfaction.NotYetResponded));
  });

  it('does not allow satisfaction to change', function() {
    return markSatisfied(alice)()
    .then(markUnsatisfied(alice))
    .then(() => {
      return bc.responses.call(alice);
    })
    .then(assertValueOf(Satisfaction.Satisfied));
  });

  it('should chill out', function() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(null);
      }, 10);
    });
  });

});