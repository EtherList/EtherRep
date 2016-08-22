import "./EtherRep.sol";
import "./BasicContract.sol";

contract EtherList {
  event CreateContract(address newContractAddr);

  enum ContractStatus { NotEtherList, InProgress, Completed }

  mapping (address => ContractStatus) public contractStatii;
  address public erep;
  address owner;

  function EtherList(address etherrepAddr) {
    erep = etherrepAddr;
    owner = msg.sender;
  }

  function createContract(address seller, address buyer) returns (address) {
    // 1. create contract on chain
    address c = address(new BasicContract(seller, buyer));
    // 2. register address of contract in contractStatii
    contractStatii[c] = ContractStatus.InProgress;
    CreateContract(c);
    return c;
  }

  function completeContract(address contractAddr) {
    // 1. verify sender of transaction (EtherList or contract itself)
    // 2. mark it completed
    // 3. boost reputations using erep
  }

}
