var BidMarket = artifacts.require("./BidMarket.sol");
var Item = artifacts.require("./Item.sol");

module.exports = function(deployer) {
  

    deployer.deploy(
        Item, "Item 1"
    )

};