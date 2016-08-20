import "./ContractProvider.sol";
import "./EtherRepEnabled.sol";

contract RepDb is EtherRepEnabled {
  event IncreasedRep(bool result, uint amount, address addr, uint newBalance);
  event DecreasedRep(bool result, uint amount, address addr, uint newBalance);

  //Create reputation ledger
  mapping (address => uint) public repBalances;

  function increaseRep(address addr, uint amount) returns (bool res) {
    if(EREP != 0x0){
      address rep = ContractProvider(EREP).contracts("rep");

      //Only allow contract rep to successfully modify reputation of user
      if (msg.sender == rep ){
        repBalances[addr] += amount;
        IncreasedRep(true, amount, addr, repBalances[addr]);
        return true;
      }
    }
    
    IncreasedRep(false, 0, addr, repBalances[addr]);
    return false;
  }

  function decreaseRep(address addr, uint decreaseByInt, uint decreaseDenominator) returns (bool res) {
    if(EREP != 0x0){
      address rep = ContractProvider(EREP).contracts("rep");

      //Only allow contract rep to successfully modify reputation of user
      if (msg.sender == rep ){
        uint oldBalance = repBalances[addr];

        //Decrease by greater of fixed value or percentage
        if(decreaseByInt >= oldBalance / decreaseDenominator){
          repBalances[addr] = oldBalance - decreaseByInt;
          DecreasedRep(true, decreaseByInt, addr, repBalances[addr]);
          return true;
        } else {
          repBalances[addr] = oldBalance - oldBalance / decreaseByInt;
          DecreasedRep(true, decreaseDenominator, addr, repBalances[addr]);
          return true;
        }
      }
    }

    DecreasedRep(false, decreaseByInt, addr, repBalances[addr]);
    return false;
  }

}
