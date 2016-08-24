
## EtherListJS

### Example Usage:

The following code:
```javascript
let elist = new EtherListJS('0xaddressOfEtherList...');
let bcjs;

elist.createContract(accounts[1], accounts[2])
.then(bcAddr => bcjs = new BasicContractJS(bcAddr))
.then(() => bcjs.markSatisfied(accounts[1]))
.then(() => bcjs.markUnsatisfied(accounts[2]))
.then(() => elist.getContract(bcjs.address))
.then(res => console.log(res))
.catch(err => console.error(err))
```
will eventually console log:
```
Object {buyer: "1", seller: "2", status: "1"}
```
where the numbers represent the following enumeration:
```
const Satisfaction = {
  NotYetResponded: 0,
  Unsatisfied: 1,
  Satisfied: 2
};
```

### Public API

- `#getContractStatus(contractAddr)` N.B. the enumeration returned here is NOT `Satisfaction`, but is `ContractStatus`
- `#getContract(contractAddr)`
- `#createContract(sellerAddr, buyerAddr)`

## BasicContractJS

### Public API

- `#getContract()` returns an object containing all useful details for given contract
- `#getBuyerAddress()`
- `#getBuyerSatisfaction()`
- `#getSellerAddress()`
- `#getSellerSatisfaction()`

