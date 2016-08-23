var accounts = [];
var account;

window.onload = function() {
  web3.eth.getAccounts((err, accts) => {
    if (err !== null) {
      return console.error('There was an error fetching your accounts.');
    }

    if (accts.length === 0) {
      return console.error('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
    }

    // Set up easy access to provided accounts
    accounts = accts;
    account = accts[0];
  });
}
