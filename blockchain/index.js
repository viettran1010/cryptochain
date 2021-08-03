const Block = require("./block");
const { cryptoHash } = require("../util");
const { REWARD_INPUT, MINING_REWARD } = require("../config");
const Transaction = require("../wallet/transaction");
const Wallet = require("../wallet/");

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data,
    });

    this.chain.push(newBlock);
  }

  replaceChain(chain, validateTransaction, onSuccess) {
    if (chain.length <= this.chain.length) {
      console.error("The incoming chain must be longer");
      return;
    }
    if (!Blockchain.isValidChain(chain)) {
      console.error("The incoming chain must be valid");
      return;
    }

    if (validateTransaction && !this.validTransactionData({ chain })) {
      console.error("the incoming chain has invalid data");
      return;
    }

    onSuccess && onSuccess();
    console.log(`replacing chain with ${JSON.stringify(chain)}`);
    this.chain = chain;
  }

  // this is not static since we will rely on instance's blockchain history to validate,
  // not the input's because that can be faked
  validTransactionData({ chain }) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      let rewardTransactionCount = 0;

      const transactionSet = new Set();

      for (let transaction of block.data) {
        if (transaction.input.address === REWARD_INPUT.address) {
          rewardTransactionCount++;
          if (rewardTransactionCount > 1) {
            console.error("there are more than 1 reward transaction per block");
            return false;
          }
          if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
            console.error("miner reward amout is invalid");
            return false;
          }
        } else {
          if (!Transaction.validTransaction(transaction)) {
            console.error("invalid transaction");
            return false;
          }

          // check balance when input chain is faked
          const trueBalance = Wallet.calculateBalance({
            chain: this.chain,
            address: transaction.input.address,
          });

          if (transaction.input.amount !== trueBalance) {
            console.error("invalid input amount");
            return false;
          }
        }

        if (transactionSet.has(transaction)) {
          console.error("there are identical transactions");
          return false;
        } else transactionSet.add(transaction);
      }
    }

    return true;
  }

  static isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
      return false;

    for (let i = 1; i < chain.length; i++) {
      const { timestamp, lastHash, hash, data, nonce, difficulty } = chain[i];

      const actualLastHash = chain[i - 1].hash;

      const lastDifficulty = chain[i - 1].difficulty;

      if (lastHash !== actualLastHash) return false;

      const validatedHash = cryptoHash(
        actualLastHash,
        timestamp,
        data,
        nonce,
        difficulty
      );

      if (hash !== validatedHash) return false;

      //if difficulty raised too dramatically, it could slow down the how system
      if (Math.abs(lastDifficulty - difficulty) > 1) return false;
    }

    return true;
  }
}

module.exports = Blockchain;
