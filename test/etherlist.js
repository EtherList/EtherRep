contract('EtherList', function(accounts) {
  let elist;
  let erep;

  beforeEach(function() {
    erep = EtherRep.deployed();
    return EtherList.new(erep.address)
    .then(instance => { elist = instance; });
  });

  it('is deployed with EtherReps address', function() {
    return elist.erep.call().then(erepAddr => {
      assert.equal(erepAddr, erep.address);
    });
  });

});
