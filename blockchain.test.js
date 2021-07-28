const BlockChain = require('./blockchain')
const Block = require('./block')

describe('Blockchian', ()=> {
    const blockchain = new BlockChain();

    it('contains a chain array instance', ()=> {
        expect(blockchain.chain instanceof Array).toBe(true);
    })

    it('starts with the genesis block', ()=> {
        expect(blockchain.chain[0]).toEqual(Block.genesis())
    })

    it('can add new block to chain', ()=> {
        const newData = 'foo bar';
        blockchain.addBlock({data:newData});

        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData)
    })
})