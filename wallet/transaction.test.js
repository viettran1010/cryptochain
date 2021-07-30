const { it, expect } = require('@jest/globals');
const Transaction = require('./transaction');
const Wallet = require('./');
const {verifySignature} = require('../util')

describe('Transaction', () => {
    let transaction, senderWallet, recipient, amount;

    beforeEach(() => {
        senderWallet = new Wallet();
        recipient = 'recipient-public-key';
        amount = 50;
        transaction = new Transaction({senderWallet, recipient, amount});
    })

    it('has an id', () => {
        expect(transaction).toHaveProperty('id');
    })

    describe('outputMap', () => {
        it('has and outputMap', () => {
            expect(transaction).toHaveProperty('outputMap');
        })

        it('outputs the amount to the recipient', () => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        })

        it('outputs the remaining balance to the sender', () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance-amount);
        })
    })

    describe('input', () => {
        it('has and input', () => {
            expect(transaction).toHaveProperty('input');
        })

        it('has a timestamp in the input', () => {
            expect(transaction.input).toHaveProperty('timestamp');
        })

        it('sets the amount to the senderWallet balance', ()=> {
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        })

        it('sets the address to senderWallet publicKey', () => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        })

        it('signs the input', () => {
            expect(
                verifySignature({
                    publicKey: senderWallet.publicKey,
                    data: transaction.outputMap,
                    signature: transaction.input.signature
                })
            ).toBe(true)
        })
    })
})