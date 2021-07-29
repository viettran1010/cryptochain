const Blockchain = require('./blockchain')
const Block = require('./block')

describe('Blockchain', ()=> {
    let blockchain, newChain, originalChain;

    beforeEach(()=> { // get a new block chain for each test case
        blockchain = new Blockchain();
        newChain = new Blockchain();

        originalChain = blockchain.chain;
    })

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

    describe('isValidChain()',()=> {
        describe('when the chain does not start with the genesis block', ()=> {
            it('returns false', ()=> {
                blockchain.chain[0] = { data: 'this has data so it is not the genesis' };
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
            })
        })

        describe('when the chain starts with the genesis block and has multiple blocks', ()=> {
            beforeEach(()=>{
                blockchain.addBlock({data:'Bear'});
                blockchain.addBlock({data:'Beets'});
                blockchain.addBlock({data:'Battlestar Galatica'});
            })
            describe('and a lastHash ref has chaged', ()=> {
                it('returns false', ()=> {
                    blockchain.chain[2].lastHash = 'broken-lastHash';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
                })
            })

            describe('and there is invalid field value', ()=> {
                it('returns false', ()=> {
                    blockchain.chain[2].lastHash = 'bad data';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
                })
            })

            describe('and the chain does not contain any invalid blocks', ()=> {
                it('returns true', ()=> {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true)
                })
            })
        })
    })

    describe('replaceChain()',()=> {

        let errMock, logMock;

        beforeEach(()=> {
            //prevent printing error messages in tests
            errMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errMock;
            global.console.log = logMock;
        })

        describe('when the chain is not longer', ()=> {
            beforeEach(()=> {
                newChain.chain[0] = {new:'chain'}
                blockchain.replaceChain(newChain.chain)
            })
            it('does not replace the chain', ()=> {
                expect(blockchain.chain).toEqual(originalChain)
            })
            it('logs an error',()=> {
                expect(errMock).toHaveBeenCalled();
            })
        })

        describe('when the chain is longer', ()=> {
            beforeEach(()=>{
                newChain.addBlock({data:'Bear'});
                newChain.addBlock({data:'Beets'});
                newChain.addBlock({data:'Battlestar Galatica'});
            })

            describe('and the chain is invalid', ()=> {
                it('does not replace the chain', ()=> {
                    newChain.chain[2].hash = 'some-fake-hash'

                    blockchain.replaceChain(newChain.chain)
                    expect(blockchain.chain).toEqual(originalChain)
                })    
            })

            describe('and the chain is valid', ()=> {
                it('does replace the chain', ()=> {
                    blockchain.replaceChain(newChain.chain)
                    expect(blockchain.chain).toEqual(newChain.chain)
                })
            })
        })
    })
})