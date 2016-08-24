var accounts = [];
var account;

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

class EtherListJS {
  constructor(etherlistAddr) {
    this.elist = EtherList.at(etherlistAddr);
  }

  /**
   * Gets the contract status. Does not return any contract details.
   * See #getContract() for more details.
   *
   * Return value is an enumeration:
   *   0 -> Contract is not managed by EtherList
   *   1 -> Contract is in progress
   *   2 -> Contract is completed. See #getContract() to get results
   * 
   * @param  {address} contractAddr Address of contract to check
   * @return {integer}              Enumeration of contract status
   */
  getContractStatus(contractAddr) {
    return this.elist.contractStatii.call(contractAddr)
    .then(bigIntContractStatus => {
      return bigIntContractStatus.valueOf();
    });
  }

  /**
   * Returns an object representing current contract status
   *
   * "buyer" and "seller" will contain enumerations:
   *   0 -> NotYetResponded
   *   1 -> Unsatisfied
   *   2 -> Satisfied
   *
   * "status" contains an enumeration:
   *   0 -> Waiting for at least one party to respond (in progress)
   *   1 -> At least one party was unsatisfied (complete)
   *   2 -> Both parties were satisfied (complete)
   * 
   * @param  {address} contractAddr Address of contract to inspect
   * @return {object}               Object of contract details
   */
  getContract(contractAddr) {
    const bc = new BasicContractJS(contractAddr);
    return bc.getContract();
  }

}

class BasicContractJS {
  constructor(contractAddr) {
    this.bc = BasicContract.at(contractAddr);
  }

  getBuyerAddress() {
    return this.bc.buyer.call();
  }

  getBuyerSatisfaction() {
    return this.getBuyerAddress()
    .then(bAddr => this.getResponse(bAddr));
  }

  getSellerAddress() {
    return this.bc.seller.call();
  }

  getSellerSatisfaction() {
    return this.getSellerAddress()
    .then(sAddr => this.getResponse(sAddr));
  }

  getResponse(wallet) {
    return this.bc.responses.call(wallet);
  }

  getStatus() {
    return this.bc.getStatus.call();
  }

  getContract() {
    let obj = {};
    let addBigIntAsProp = key => bigInt => obj[key] = bigInt.valueOf();

    return this.getBuyerSatisfaction()
    .then(addBigIntAsProp('buyer'))
    .then(() => this.getSellerSatisfaction())
    .then(addBigIntAsProp('seller'))
    .then(() => this.getStatus())
    .then(addBigIntAsProp('status'))
    .then(() => obj)
    .catch(err => console.error(err));
  }

  markSatisfied(who) {
    return this.bc.markCompleted(2, {from: who});
  }

  markUnsatisfied(who) {
    return this.bc.markCompleted(1, {from: who});
  }
}

window.onload = function() {
  web3.eth.getAccounts((err, accts) => {
    if (err !== null) {
      return console.error('There was an error fetching your accounts.');
    }

    if (accts.length === 0) {
      return console.error('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
    }

    // Set up easy access to provided accounts
    accounts = accts;
    account = accts[0];

    // testing
    // 
    
    let elistAddr = '0x80ca38a52bc00fa7b0060b43cceffed5979c16bc';
    let elist = EtherList.at(elistAddr);
    let bcAddr;
    let bcjs;
    let wait = ms => () => new Promise(resolve => setTimeout(resolve, ms));

    elist.CreateContract({}).watch((err, log) => {
      if (err) console.error(err);
      console.log('contract created at ' + log.args.newContractAddr)
      bcAddr = log.args.newContractAddr;
      bcjs = new BasicContractJS(bcAddr);
    });

    elist.createContract(accounts[1], accounts[2], {from: accounts[0]})
    .then(wait(1000))
    .then(() => bcjs.markSatisfied(accounts[1]))
    .then(() => bcjs.markUnsatisfied(accounts[2]))
    .then(() => new EtherListJS(elistAddr).getContractStatus(bcAddr))
    .then(c => console.log(c))
    .catch(bla => console.error(bla))
  });


}
