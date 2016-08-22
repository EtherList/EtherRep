contract BasicContract {

  enum Satisfaction { NotYetResponded, Unsatisfied, Satisfied }

  address public owner;

  address private seller;
  address private buyer;

  mapping (address => Satisfaction) public responses;

  function BasicContract(address sellerAddr, address buyerAddr) {
    owner = msg.sender;
    seller = sellerAddr;
    buyer = buyerAddr;
  }

  function markCompleted(Satisfaction senderSatisfaction) {
    if (responses[msg.sender] != Satisfaction.NotYetResponded) {
      return;
    }
    
    responses[msg.sender] = senderSatisfaction;
  }

  function isCompleted() returns (Satisfaction) {
    return responses[seller] < responses[buyer] ? responses[seller] : responses[buyer];
  }

}
