const { it } = require('@jest/globals');
const Wallet = require('./index');
const {verifySignature} = require('../util')
const Transaction = require('./transaction')

describe('Wallet', ()=>{
    let wallet;

    beforeEach(()=> {
        wallet = new Wallet();
    })

    it('has a balance', ()=>{
        expect(wallet).toHaveProperty('balance');
    })

    it('has a public key', ()=>{
        expect(wallet).toHaveProperty('publicKey');
    })

    describe('signing data', ()=>{
        const data = 'foobar';

        it('verifies a signature', ()=>{
            expect(            
                verifySignature({ 
                publicKey: wallet.publicKey, 
                data,
                signature: wallet.sign(data) //can only verify with the same wallet with public/private key
            })).toBe(true)
        })

        it('does not verify an invalid signature', ()=>{
            expect(            
                verifySignature({ 
                publicKey: wallet.publicKey, 
                data,
                signature: (new Wallet()).sign(data) //different wallet
            })).toBe(false)
        })
    })

    describe('createTransaction()', ()=>{
        describe('and the amout exceeds the balance', ()=>{
            it('throw an error', ()=> {
                expect(()=> wallet.createTransaction({amount:99999, recipient:'foo-recipient'}))
                    .toThrow('amount exceeds balance');
            })
        })

        describe('and the amount is valid', ()=>{
            let transaction, amount, recipient;

            beforeEach(()=> {
                amount = 50;
                recipient = 'foo-recipient';
                transaction = wallet.createTransaction({amount, recipient})
            })

            it('creates an instance oftransaction', ()=> {
                expect(transaction instanceof Transaction).toBe(true)
            })

            it('matches the transaction input with the wallet', ()=> {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            })

            it('outputs the amount of the recipient', ()=> {
                expect(transaction.outputMap[recipient]).toEqual(amount)
            })
        })
    })
})