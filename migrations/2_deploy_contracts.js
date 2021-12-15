var BidMarket = artifacts.require("./BidMarket.sol");
var Item = artifacts.require("./Item.sol");

module.exports = function(deployer) {
    deployer.deploy(
        BidMarket, "BID MARKET", 1, 200, "0xa27971c412c1FCE099255BDfA8d44B0700EF1fc9"
    )

    deployer.deploy(
        Item, "Item 1"
    )

};