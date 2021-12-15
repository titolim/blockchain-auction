// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./BaseContract.sol";
//import "hardhat/console.sol";



/************************
* To bid on this auction, you need to enter your Bid price and call the Bid function
* You need to send wei when you call the Bid function
* You can withdraw your bid if you are not the highest bidder
* At the end of the auction, call payout to refund non winner and send the highest bid amount to seller
****************************/
contract ItemContract is BaseContract {

    enum State {
        Active,
        Ended
    }

    struct Item {
        string Name;
        string Description;
        uint CurrentBidPrice;
        address HighestBidder;
        uint DurationDays;
        State CurrentState;
    }

    Item item;

    mapping(address => uint) public amounts;

    modifier inState(State expectedState) {
        require(item.CurrentState == expectedState, "The auction is in incorrect state.");
        _;
    }

    modifier isActive() {
        require(item.CurrentState == State.Active, "The auction is not active.");
        require(currentTime() < item.DurationDays, "The auction has ended.");
        _;
    }

    modifier notHighestBidder() {
        require(msg.sender != item.HighestBidder, "You are the hightest bidder. You cannot withdraw your bid.");
        _;
    }

    event NewHighestBid(
        address HighestBidder,
        uint NewBidPrice
    );

    // Comment avoir un contrat qui est appellé seulement a partir du contrat Marketplace
    constructor(string memory name, string memory description, uint startingBidPrice, uint durationMinutes) {
        require(durationMinutes >= 1, "Please specify the duration greater or equal than 1 minute");
        item = Item(name, description, startingBidPrice, address(0x0), currentTime() + durationMinutes * 1 minutes, State.Active);
    }

    function getItem() public view returns(Item memory) {
        return item;
    }

    function getCurrentTime() public returns(uint) {

        if (currentTime() > item.DurationDays) {
            item.CurrentState = State.Ended;
        }

        return currentTime();
    }

    function Bid(uint bidPrice) public payable isActive {
        require(bidPrice > item.CurrentBidPrice, "Your bid is lower than the current bid");

        uint neededWei = bidPrice - amounts[msg.sender];

        require(neededWei == msg.value, "You need to send wei with your bid. Please call NeededWei to get the required wei amount.");

        amounts[msg.sender] += msg.value;
        item.CurrentBidPrice = bidPrice;
        item.HighestBidder = msg.sender;

        emit NewHighestBid(item.HighestBidder, item.CurrentBidPrice);
    }

    function NeededWei(uint bidPrice) public view inState(State.Active) returns (uint) {
        uint neededWei = bidPrice - amounts[msg.sender];
        return neededWei;
    }

    function getMyBalanceAmount() public view returns(uint) {
        return amounts[msg.sender];
    }

    function withdrawMyBid() public payable notHighestBidder {
        require(amounts[msg.sender] > 0, "You don't have nothing to withdraw");

        uint bidded = amounts[msg.sender];
        amounts[msg.sender] = 0;

        if (!payable(msg.sender).send(bidded)) {
            amounts[msg.sender] = bidded;
        }
    }

    function getContractBalance() public view returns (uint) {
        return address(this).balance; // en wei
    }

    function payout() public payable inState(State.Ended) {
        // call getCurrentTime to update auction state

        require(getContractBalance() >= item.CurrentBidPrice, "Not enought wei to pay");

        payable(owner).transfer(item.CurrentBidPrice);

        // also refunds non winners
    }

    /*******
    * TODO *
    ********/
    // Comment closer l'auction automatiquement
    // Payer le vendeur lorsque l'item est livré => UPS call le payout
    // uploader les images dans IPFS


    /*
    string private message;

    function setMessage(string memory newMessage) public {
        message = newMessage;
    }

    function getMessage() public view returns (string memory) {
        return message;
    }
    */
}