import "./EtherRep.sol";

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
    if (msg.sender == owner) {
      // fancy stuff
    } else if (uint(contractStatii[msg.sender]) == 1 && msg.sender == contractAddr) {
      // 2. mark it completed
      contractStatii[msg.sender] = ContractStatus.Completed;
      // 3. boost reputations IF successful
      //    hurt reputation   IF not successful
      BasicContract bc = BasicContract(msg.sender);
      uint status = uint(bc.getStatus());
      if (status == 2) {
        EtherRep(erep).increaseReputation(bc.seller(), 10);
        EtherRep(erep).increaseReputation(bc.buyer(), 10);
      } else {
        EtherRep(erep).decreaseReputation(bc.seller(), 5);
        EtherRep(erep).decreaseReputation(bc.buyer(), 5);
      }
    }
  }

}

contract BasicContract {

  enum Satisfaction { NotYetResponded, Unsatisfied, Satisfied }

  address public elist;

  address public seller;
  address public buyer;

  mapping (address => Satisfaction) public responses;

  function BasicContract(address sellerAddr, address buyerAddr) {
    elist = msg.sender;
    seller = sellerAddr;
    buyer = buyerAddr;
  }

  function markCompleted(Satisfaction senderSatisfaction) {
    // 1. Check that the user has not already responded
    if (responses[msg.sender] != Satisfaction.NotYetResponded) {
      return;
    }
    // 2. Set user response
    responses[msg.sender] = senderSatisfaction;
    // 3. Check whether the contract is completed
    //    and if it is, let EtherList know
    if (uint(getStatus()) > 0) {
      EtherList(elist).completeContract(this);
    }
  }

  function getStatus() returns (Satisfaction) {
    return responses[seller] < responses[buyer] ? responses[seller] : responses[buyer];
  }

}
