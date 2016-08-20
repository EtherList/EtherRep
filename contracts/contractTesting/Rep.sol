import "./EtherListEnabled.sol";
import "./ContractProvider.sol";
import "./RepDb.sol";

contract Rep is EtherListEnabled {

  event IncreasedRep(bool result, uint amount, address addr);
  event DecreasedRep(bool result, uint decreaseByInt, uint decreaseByDenominator, address addr);

  //TODO: include mapping of max increases/decreases allowed by contract factories like EtherList
  function increaseRep(address userAddr) returns (bool res) {
    //Define amount to increase rep
    uint increaseBy = 10;

    //Only EtherList may successfully modify rep level
    if (!isEtherListEnabled()){
      IncreasedRep(false, 0, userAddr);
      return false;
    }

    address repdb = ContractProvider(EREP).contracts("repdb");

    //Alert listener if dependency not met
    if ( repdb == 0x0 ) {
      IncreasedRep(false, 0, userAddr);
      return false;
    }

    //Call repdb contract; alert listener of success/failure
    if(!RepDb(repdb).increaseRep(userAddr, increaseBy)) {
      IncreasedRep(false, 0, userAddr);
      return false;
    } else {
      IncreasedRep(true, increaseBy, userAddr);
      return true;
    }
  }

  function decreaseRep(address userAddr) returns (bool res) {
    //Define amount to decrease rep
    uint decreaseByInt = 10;
    uint decreaseByDenominator = 10;

    //Only EtherList may modify rep level
    if (!isEtherListEnabled()){
      DecreasedRep(false, 0, 0, userAddr);
      return false;
    }

    address repdb = ContractProvider(EREP).contracts("repdb");

    //Alert listener if dependency not met
    if ( repdb == 0x0 ) {
      DecreasedRep(false, 0, 0, userAddr);
      return false;
    }

    //Call repdb contract; alert listener of success/failure
    if (!RepDb(repdb).decreaseRep(userAddr, decreaseByInt, decreaseByDenominator)) {
      DecreasedRep(false, 0, 0, userAddr);
      return false;
    } else {
      DecreasedRep(true, decreaseByInt, decreaseByDenominator, userAddr);
      return true;
    }
  }

}
