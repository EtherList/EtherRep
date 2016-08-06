contract EtherRep {
  event Rating(address from, address to, uint rating);

  mapping (address => uint) numRatings;
  mapping (address => uint) reputation;

  function getRating(address who) returns(uint) {
    return reputation[who];
  }

  function rateUser(address who, uint rating) {
    numRatings[who] += 1;
    reputation[who] += rating/numRatings[who] - reputation[who]/numRatings[who];
    Rating(msg.sender, who, rating);
  }
}
