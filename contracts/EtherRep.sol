contract EtherRep {

  // TODO : add events for listeners
  
  mapping (address => uint) public maxIncrement;
  mapping (address => uint) public maxDecrement;
  mapping (address => uint) public reputation;
  address owner;

  function EtherRep() {
    owner = msg.sender;
  }

  function increaseReputation(address userAddr, uint points) returns (bool success) {
    // 1. check permissions, cap points
    uint increment = points > maxIncrement[msg.sender] ? maxIncrement[msg.sender] : points;
    if (increment == 0) {
      return false;
    }
    // 2. increase reputation
    reputation[userAddr] += increment;
    // 3. alert listeners
    return true;
  }

  function decreaseReputation(address userAddr, uint points) returns (bool success) {
    // 1. check permissions, cap points
    uint decrement = points > maxDecrement[msg.sender] ? maxDecrement[msg.sender] : points;
    // 2. decrease reputation, check for underflow
    uint newRep = reputation[userAddr] - decrement;
    reputation[userAddr] = newRep > reputation[userAddr] ? 0 : newRep;
    // 3. alert listeners
    return true;
  }

  function setPermissionLimits(address factoryAddr, uint maxInc, uint maxDec) returns (bool success) {
    // 1. check permission
    if (msg.sender != owner) {
      return false;
    }
    // 2. set limits
    maxIncrement[factoryAddr] = maxInc;
    maxDecrement[factoryAddr] = maxDec;
    // 3. notify listeners
    return true;
  }

}
