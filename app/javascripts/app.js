var accounts;
var account;
var balance;

function setStatus(message) {
  var status = document.getElementById("status");
  status.innerHTML = message;
};

function setRating(rating) {
  document.getElementById('rating').innerHTML = rating.valueOf();
}

function refreshBalance() {
  var meta = MetaCoin.deployed();

  meta.getBalance.call(account, {from: account}).then(function(value) {
    var balance_element = document.getElementById("balance");
    balance_element.innerHTML = value.valueOf();
  }).catch(function(e) {
    console.log(e);
    setStatus("Error getting balance; see log.");
  });
};

function sendCoin() {
  var meta = MetaCoin.deployed();

  var amount = parseInt(document.getElementById("amount").value);
  var receiver = document.getElementById("receiver").value;

  setStatus("Initiating transaction... (please wait)");

  meta.sendCoin(receiver, amount, {from: account}).then(function() {
    setStatus("Transaction complete!");
    refreshBalance();
  }).catch(function(e) {
    console.log(e);
    setStatus("Error sending coin; see log.");
  });
};

function refreshRating() {
  var rep = EtherRep.deployed();

  return rep.getRating.call(account, {from: account}).then(rating => {
    return setRating(rating);
  }).catch(e => console.error(e));
}

function submitRating() {
  var rep = EtherRep.deployed();
  var rating = parseInt(document.getElementById('newRating').value);

  setStatus(`Rating ${account} with ${rating}. please wait`);
  return rep.rateUser(account, rating, {from: account})
    .then(tx_id => {
      setStatus('Finished.');
      return refreshRating();
    })
    .catch(e => console.error(e));
}

window.onload = function() {
  web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    accounts = accs;
    account = accounts[0];

    refreshBalance();
    refreshRating();
  });
}
