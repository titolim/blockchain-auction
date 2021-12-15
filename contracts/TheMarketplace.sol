// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./BaseContract.sol";
import "./Item.sol";

// private: cannot be access from a child but only in the current contract
// internal: can be accessed from a child contract in the same project
contract TheMarketPlace is BaseContract {
    
    address[] items;

    function addItem(string memory name, string memory description, uint startingBidPrice, uint durationMinutes) public {
        address newItem = address(new ItemContract(name, description, startingBidPrice, durationMinutes));
        items.push(newItem);
    }

    function getItems() public view returns (address[] memory) {
        return items;
    }

    /*******
    * test *
    *******/
    string private message;

    function setMessage(string memory newMessage) public {
        message = newMessage;
    }

    function getMessage() public view returns (string memory) {
        return message;
    }
}