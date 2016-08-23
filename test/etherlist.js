contract('BasicContract', function(accounts) {
  let erep;
  let elist;
  let bc;
  let filter;
  let zero = accounts[0];
  let alice = accounts[1];
  let bob   = accounts[2];
  let contractAddr = null;

  let ContractStatus = {
    NotEtherList: 0,
    InProgress: 1,
    Completed: 2
  };

  const Satisfaction = {
    NotYetResponded: 0,
    Unsatisfied: 1,
    Satisfied: 2
  };

  let setFactoryPerms = (maxInc, maxDec) => () => erep.setPermissionLimits(elist.address, maxInc, maxDec, {from: zero});
  let getRep = (who) => () => erep.reputation.call(who);
  let markSatisfied = (who) => () => bc.markCompleted(Satisfaction.Satisfied, {from: who});
  let markUnsatisfied = (who) => () => bc.markCompleted(Satisfaction.Unsatisfied, {from: who});
  let assertValueOf = (expected) => (bigInt) => assert.equal(bigInt.valueOf(), expected);
  let wait = (ms) => () => new Promise((resolve) => {setTimeout(() => {resolve(null)}, ms)});

  function assertStatus(expected) {
    return bc.getStatus.call()
    .then(assertValueOf(expected));
  }

  before(function() {
    erep = EtherRep.deployed();
    return EtherList.new(erep.address)
    .then(elistInstance => {
      elist = elistInstance;
      filter = elist.CreateContract({});
      filter.watch((error, log) => {
        if (error) {
          console.error('err=', error);
        } else {
          contractAddr = log.args.newContractAddr;
        }
      });
    })
    .then(setFactoryPerms(10, 5));
  });

  beforeEach(function() {
    contractAddr = null;
    elist.createContract(alice, bob);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        bc = BasicContract.at(contractAddr);
        resolve(null)
      }, 1000);
    });
  });

  after(function() {
    filter.stopWatching();
  });

  describe('EtherList', function() {
    it('is deployed with EtherReps address', function() {
      return elist.erep.call().then(erepAddr => {
        assert.equal(erepAddr, erep.address);
      });
    });

    it('creates a contract', function() {
      return elist.createContract(alice, bob)
      .then(wait(1000))
      .then(() => {
        return elist.contractStatii.call(contractAddr)
      })
      .then(assertValueOf(ContractStatus.InProgress));
    });

    it('increases reputation when a contract completes successfully', function() {
      return elist.createContract(alice, bob)
      .then(wait(1000))
      .then(markSatisfied(alice))
      .then(markSatisfied(bob))
      .then(getRep(alice))
      .then(assertValueOf(10))
      .then(getRep(bob))
      .then(assertValueOf(10));
    });

    it('decreases reputation when both parties are unsatisfied', function() {
      return elist.createContract(alice, bob)
      .then(wait(1000))
      .then(markUnsatisfied(alice))
      .then(markUnsatisfied(bob))
      .then(getRep(alice))
      .then(assertValueOf(5))
      .then(getRep(bob))
      .then(assertValueOf(5));
    });

    it('decreases reputation when one of the parties is unsatisfied', function() {
      return elist.createContract(alice, bob)
      .then(wait(1000))
      .then(markSatisfied(alice))
      .then(markUnsatisfied(bob))
      .then(getRep(alice))
      .then(assertValueOf(0))
      .then(getRep(bob))
      .then(assertValueOf(0));
    });
  });

  describe('BasicContract', function() {
    it('completes successfully when both parties are satisfied', function() {
      return markSatisfied(alice)()
      .then(markSatisfied(bob))
      .then(assertStatus(Satisfaction.Satisfied));
    });

    it('completes unsuccessfully if a party marks it so', function() {
      return markSatisfied(alice)()
      .then(markUnsatisfied(bob))
      .then(assertStatus(Satisfaction.Unsatisfied));
    });

    it('is not completed if one party tries to complete it twice', function() {
      return markSatisfied(alice)()
      .then(markSatisfied(alice))
      .then(assertStatus(Satisfaction.NotYetResponded));
    });

    it('does not allow satisfaction to change', function() {
      return markSatisfied(alice)()
      .then(markUnsatisfied(alice))
      .then(() => {
        return bc.responses.call(alice);
      })
      .then(assertValueOf(Satisfaction.Satisfied));
    });
  });

  

  it('should chill out', function() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(null);
      }, 10);
    });
  });

});