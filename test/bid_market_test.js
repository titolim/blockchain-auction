let BidMarket = artifacts.require("./BidMarket");

contract("BidMarket", function(accounts) {

    let contract;
    let contractCreator = accounts[0];
    let beneficiary = accounts[1];

    const ONE_ETH = 1000000000000000000; // 1 eth = 1000000000000000000 wei
    const ON_GOING_STATE = 0;

    beforeEach(async function() {
        contract = await BidMarket.new(
            "Tito's First Tweet NFT",
            1,
            10,
            beneficiary,
            {
                from: contractCreator,
                gas: 2000000
            }
        );
    });

    it("contract is initialized", async function() {
        let itemName = await contract.itemName.call();
        expect(itemName).to.equal("Tito's First Tweet NFT");

        let targetAmount = await contract.targetAmount.call();
        expect(targetAmount.toNumber()).to.equal(ONE_ETH);

        let ben = await contract.beneficiary.call();
        expect(ben).to.equal(beneficiary);

        let state = await contract.state.call();
        expect(state.valueOf()).to.equal(ON_GOING_STATE);
    });

    /*
    it("funds are contributed", async function() {
        await contract.bid({
            value: ONE_ETH,
            from: contractCreator
        });

        let contributed = await contract.amounts.call(contractCreator);
        expect(contributed.toNumber()).to.equal(ONE_ETH);

    });
    */
});