import {Inject, Injectable} from '@angular/core';
import { WEB3 } from '../../core/web3';
import contract from 'truffle-contract';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

import Web3 from 'web3';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

declare let require: any;
const tokenAbi = require('../../../../../Blockchain/build/contracts/Payment.json');
const itemAbi = require('../../core/Item.json');
declare let window: any;

@Injectable({
  providedIn: 'root'
})

export class ContractService {
  public accountsObservable = new Subject<string[]>();
  public compatible: boolean;
  web3Modal;
  web3js;
  provider;
  public accounts;
  public balance;

  constructor(@Inject(WEB3) private web3: Web3 ,private snackbar: MatSnackBar) {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          infuraId: "27e484dcd9e3efcfd25a83a78777cdf1" // required
        }
      }
    };

    this.web3Modal = new Web3Modal({
      network: "mainnet", // optional
      cacheProvider: true, // optional
      providerOptions, // required
      theme: {
        background: "rgb(39, 49, 56)",
        main: "rgb(199, 199, 199)",
        secondary: "rgb(136, 136, 136)",
        border: "rgba(195, 195, 195, 0.14)",
        hover: "rgb(16, 26, 32)"
      }
    });
  }


  async connectAccount() {
    this.provider = await this.web3Modal.connect(); // set provider
    this.web3js = new Web3(this.provider); // create web3 instance
    this.accounts = await this.web3js.eth.getAccounts();
    return this.accounts;
  }

  async accountInfo(accounts){
    const initialvalue = await this.web3js.eth.getBalance(accounts[0]);
    this.balance = this.web3js.utils.fromWei(initialvalue , 'ether');
    return this.balance;
  }

  setMessage(msg){
    console.log('calling set message: ' + msg);
    this.web3js.eth.getAccounts().then(accounts => {
      for (var account of accounts) {
          this.showAccountBalance(account, 'ether');
      }
  });

/*
    var abi = readJsonFile('abi.json');
    var contractAddress = "0x";
    var contract = new this.web3js.eth.Contract(abi, contractAddress);

    // write
    var receipt = await contract.methods.vote(1).send({
      from: senderAddress,
      gas: 15000000
    })
    .then(function(receipt){
      // receipt
    });

    // read
    contract.methods.getVotes().call().then(function(result) {});
*/

    // deployer contract
    //var Voter = new this.web3js.net.Contract(abi);
    //var newContract = await Voter.deploy({data: bytecode}).send({from: "address", gas: 1500000});


    //var abi = JSON.parse(itemAbi);//require('../../../../../Blockchain/build/contracts/Item.json');
    console.log(itemAbi.abi);
    var contractAddress = "0xDCAEE9dc14D00BCA83a14c54C567F80e2bF9582f";
    var contract = new this.web3js.eth.Contract(itemAbi.abi, contractAddress);
    var test = contract.methods.setMessage("a new message" + new Date()).send({from:this.accounts[0]});
    var messgage = contract.methods.getMessage().call((err, res) => {
      console.log("result is: " + res);
    });
  }

 showAccountBalance(address, unit) {
  this.web3.eth.getBalance(address, (err, wei) => {
        console.log(`Account: ${address}\nBalance: ${this.web3.utils.fromWei(wei, unit)} ${unit}\n`);
    });
}

  trasnferEther(originAccount, destinyAccount, amount) {
    const that = this;

    return new Promise((resolve, reject) => {
      const paymentContract = contract(tokenAbi);
      paymentContract.setProvider(this.provider);
      paymentContract.deployed().then((instance) => {
        let finalAmount =  this.web3.utils.toBN(amount)
        console.log(finalAmount)
        return instance.nuevaTransaccion(
          destinyAccount,
          {
            from: originAccount[0],
            value: this.web3.utils.toWei(finalAmount, 'ether')
          }
          );
      }).then((status) => {
        if (status) {
          return resolve({status: true});
        }
      }).catch((error) => {
        console.log(error);

        return reject('Error transfering Ether');
      });
    });
  }


  failure(message: string) {
    const snackbarRef = this.snackbar.open(message);
    snackbarRef.dismiss()
  }

  success() {
    const snackbarRef = this.snackbar.open('Transaction complete successfully');
    snackbarRef.dismiss()
  }
}
