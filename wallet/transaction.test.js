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

    describe('validTransaction()', () => {

        let errMock;

        beforeEach(() => {
            errMock = jest.fn();
            global.console.error = errMock;
        })

        describe('when the transaction is valid', () => {
            it('returns true', ()=> {
                expect(Transaction.validTransaction(transaction)).toBe(true)
            })
        })
        describe('when the transaction is invalid', () => {
            describe('and a transaction outputMap value is invalid', () => {

                it('returns false and logs error', ()=> {
                    transaction.outputMap[senderWallet.publicKey] = 999999; // invalid amount
                    expect(Transaction.validTransaction(transaction)).toBe(false)
                    expect(errMock).toHaveBeenCalled();
                })
            })

            describe('and a transaction input signature is invalid', () => {
                it('returns false and logs error', ()=> {
                    transaction.input.signature = new Wallet().sign('data')
                    expect(Transaction.validTransaction(transaction)).toBe(false)
                    expect(errMock).toHaveBeenCalled();    
                })
            })
        })
    })

    describe('update()', () => {
        let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

        describe('and the amount is invalid', () => {
            it('throws an error', ()=> {
                expect(()=> {
                    transaction.update({ 
                        senderWallet, recipient: 'foo', amount: 999999
                    })    
                }).toThrow('amount exceeds balance');
            })
        })

        describe('and the amount is valid', () => {
            beforeEach(() => {
                originalSignature = transaction.input.signature;
                originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
                nextRecipient = 'next-recipient';
                nextAmount = 50;
    
                transaction.update({senderWallet,recipient:nextRecipient, amount:nextAmount});
            })
    
            it('outputs the amount to the next recipient', ()=> {
                expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
            })
    
            it('substracts the amount from the original sender output amount', ()=> {
                expect(transaction.outputMap[senderWallet.publicKey])
                    .toEqual(originalSenderOutput-nextAmount);
            })
    
            it('maintains a total output that matches the the input amount', ()=> {
                //check the sum of amount to transfer to equal the balance of input transaction
                expect(Object.values(transaction.outputMap) 
                .reduce((total,outputAmount)=>total+outputAmount))
                .toEqual(transaction.input.amount)
            })
    
            it('resigns the transaction', ()=> {
                expect(transaction.input.signature).not.toEqual(originalSignature);
            })    

            describe('and another update for the same recipient', ()=> {
                let addedAmount;

                beforeEach(() => {
                    addedAmount = 80;
                    transaction.update({senderWallet,recipient: nextRecipient, amount: addedAmount})
                })

                it('adds to the recipient amount', ()=> {
                    expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount+addedAmount)
                })

                it('should subtract the new amount from the original sender output amount', ()=> {
                    expect(transaction.outputMap[senderWallet.publicKey])
                    .toEqual(originalSenderOutput-nextAmount-addedAmount)
                })
            })
        })

    })
})