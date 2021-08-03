const Blockchain = require(".");
const Block = require("./block");
const { cryptoHash } = require("../util");
const Wallet = require("../wallet");
const Transaction = require("../wallet/transaction");

describe("Blockchain", () => {
  let blockchain, newChain, originalChain, errMock;

  beforeEach(() => {
    // get a new block chain for each test case
    errMock = jest.fn();

    blockchain = new Blockchain();
    newChain = new Blockchain();

    originalChain = blockchain.chain;
    global.console.error = errMock;
  });

  it("contains a chain array instance", () => {
    expect(blockchain.chain instanceof Array).toBe(true);
  });

  it("starts with the genesis block", () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis());
  });

  it("can add new block to chain", () => {
    const newData = "foo bar";
    blockchain.addBlock({ data: newData });

    expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
  });

  describe("isValidChain()", () => {
    describe("when the chain does not start with the genesis block", () => {
      it("returns false", () => {
        blockchain.chain[0] = {
          data: "this has data so it is not the genesis",
        };
        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
      });
    });

    describe("when the chain starts with the genesis block and has multiple blocks", () => {
      beforeEach(() => {
        blockchain.addBlock({ data: "Bear" });
        blockchain.addBlock({ data: "Beets" });
        blockchain.addBlock({ data: "Battlestar Galatica" });
      });
      describe("and a lastHash ref has chaged", () => {
        it("returns false", () => {
          blockchain.chain[2].lastHash = "broken-lastHash";
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe("and there is invalid field value", () => {
        it("returns false", () => {
          blockchain.chain[2].lastHash = "bad data";
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe("and the chain contains a block with a jumped difficulty", () => {
        it("returns false", () => {
          const lastBlock = blockchain.chain[blockchain.chain.length - 1];
          const lastHash = lastBlock.hash;
          const timestamp = Date.now();
          const nonce = 0;
          const data = [];
          const difficulty = lastBlock.difficulty - 3;

          const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);

          const badBlock = new Block({
            timestamp,
            hash,
            data,
            nonce,
            difficulty,
          });

          blockchain.chain.push(badBlock);

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe("and the chain does not contain any invalid blocks", () => {
        it("returns true", () => {
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
        });
      });
    });
  });

  describe("replaceChain()", () => {
    let logMock;

    beforeEach(() => {
      //prevent printing error messages in tests
      logMock = jest.fn();

      global.console.error = errMock;
      global.console.log = logMock;
    });

    describe("when the chain is not longer", () => {
      beforeEach(() => {
        newChain.chain[0] = { new: "chain" };
        blockchain.replaceChain(newChain.chain);
      });
      it("does not replace the chain", () => {
        expect(blockchain.chain).toEqual(originalChain);
      });
      it("logs an error", () => {
        expect(errMock).toHaveBeenCalled();
      });
    });

    describe("when the chain is longer", () => {
      beforeEach(() => {
        newChain.addBlock({ data: "Bear" });
        newChain.addBlock({ data: "Beets" });
        newChain.addBlock({ data: "Battlestar Galatica" });
      });

      describe("and the chain is invalid", () => {
        it("does not replace the chain", () => {
          newChain.chain[2].hash = "some-fake-hash";

          blockchain.replaceChain(newChain.chain);
          expect(blockchain.chain).toEqual(originalChain);
        });
      });

      describe("and the chain is valid", () => {
        it("does replace the chain", () => {
          blockchain.replaceChain(newChain.chain);
          expect(blockchain.chain).toEqual(newChain.chain);
        });
      });
    });
  });

  describe("validTransactionData()", () => {
    let transaction, rewardTransaction;

    beforeEach(() => {
      wallet = new Wallet();
      transaction = wallet.createTransaction({
        recipient: "any-recipient",
        amount: 65,
      });
      rewardTransaction = Transaction.rewardTransaction({
        minerWallet: wallet,
      });
    });

    describe("and the transaction is valid", () => {
      it("returns true", () => {
        newChain.addBlock({ data: [transaction, rewardTransaction] });

        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
          true
        );
      });
    });

    describe("and the transaction data has multiple rewards", () => {
      it("should return false", () => {
        newChain.addBlock({
          data: [transaction, rewardTransaction, rewardTransaction],
        });

        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
          false
        );
      });
    });

    describe("and the transaction data has at least one malformed outputMap", () => {
      describe("and the transaction is not a reward transaction", () => {
        it("should return false", () => {
          transaction.outputMap[wallet.publicKey] = 999999999;
          newChain.addBlock({ data: [transaction, rewardTransaction] });
          expect(
            blockchain.validTransactionData({ chain: newChain.chain })
          ).toBe(false);
        });
      });
      describe("and the transaction is a reward transaction", () => {
        it("should return false", () => {
          rewardTransaction.outputMap[wallet.publicKey] = 999999999;
          newChain.addBlock({ data: [transaction, rewardTransaction] });
          expect(
            blockchain.validTransactionData({ chain: newChain.chain })
          ).toBe(false);
        });
      });
    });
    describe("and the transaction data has at least one malformed input", () => {
      it("returns false", () => {
        wallet.balance = 9000;

        const evilOutputMap = {
          [wallet.publicKey]: 8900,
          anyRecipient: 100,
        };

        const evilTransaction = {
          input: {
            timestamp: Date.now(),
            amount: wallet.balance,
            address: wallet.publicKey,
            signature: wallet.sign(evilOutputMap),
          },
          outputMap: evilOutputMap,
        };

        newChain.addBlock({ data: [evilTransaction, rewardTransaction] });
        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
          false
        );
      });
    });
    describe("and a block contains multiple identical transactions", () => {
      it("should return false", () => {
        newChain.addBlock({
          data: [transaction, transaction, transaction, transaction],
        });

        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
          false
        );
      });
    });
  });
});
