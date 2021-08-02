// Input: - timestamp
//        - balance: 500
//        - signature
//        - sender's public key: 0xfoo

// This is the output which includes the info of amount transferred
// Output: - amount: 40
//         - address of recipient: 0xbar

// This is the output for the owner which includes the remaining amount
// Output: - amount: 460
//         - address of owner: 0xfoo

const uuid = require('uuid')
const {verifySignature} = require('../util')
const { REWARD_INPUT, MINING_REWARD } = require('../config')

class Transaction {
    constructor({senderWallet, recipient, amount, outputMap, input}) { // input and outputMap only passed for miner transaction
        this.id = uuid.v4();
        this.outputMap = outputMap || this.createOutputMap({senderWallet, recipient, amount})
        this.input = input || this.createInput({senderWallet,outputMap: this.outputMap});
    }   

    createOutputMap({senderWallet, recipient, amount}) {
        const outputMap = {};
        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

        return outputMap;
    }

    createInput({senderWallet, outputMap}) {
        return {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputMap)
        };
    }

    update({senderWallet,recipient,amount}) {
        if (amount > this.outputMap[senderWallet.publicKey]) {
            throw new Error('amount exceeds balance');
        }

        if (this.outputMap[recipient]) {
            this.outputMap[recipient] += amount;
        }
        else
            this.outputMap[recipient] = amount;
        this.outputMap[senderWallet.publicKey] -= amount;
        
        //resigns, and we have to update input as well
        this.input = this.createInput({senderWallet, outputMap: this.outputMap});
    }

    static validTransaction(transaction) {
        const {input: {address,amount,signature}, outputMap} = transaction;

        // there are two output with amount of transferred and amount remaining, they have to
        // accumulate to the balance before the transaction happens
        const outputTotal = Object.values(outputMap).reduce((total,outputAmount)=>total + outputAmount)

        if (amount!==outputTotal) {
            console.error(`amount is invalid, address: ${address}`);
            return false;
        }

        if (!verifySignature({publicKey: address,data: outputMap,signature})) {
            console.error(`signature is invalid, address: ${address}`);
            return false;
        }

        return true;
    }

    // we want hardcoded input and output for this transaction
    static rewardTransaction({minerWallet}) {
        return new this({
            input: REWARD_INPUT,
            outputMap: { [minerWallet.publicKey]: MINING_REWARD }
        })
    }
}

module.exports = Transaction;