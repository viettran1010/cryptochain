const { it } = require('@jest/globals');
const Wallet = require('./index');
const {verifySignature} = require('../util')

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
        
    })
})