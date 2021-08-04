const redis = require("redis");

const CHANNELS = {
  TEST: "TEST",
  BLOCKCHAIN: "BLOCKCHAIN",
  TRANSACTION: "TRANSACTION",
};

class PubSub {
  constructor({ blockchain, transactionPool, redisUrl }) {
    this.publisher = redis.createClient(redisUrl);
    this.subscriber = redis.createClient(redisUrl);
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;

    this.subscribeToChannels();

    this.subscriber.on("message", (channel, message) => {
      this.handleMessage(channel, message);
    });
  }

  handleMessage(channel, message) {
    console.log(`message received: ${message} channel: ${channel}`);

    const parsedMessage = JSON.parse(message);

    switch (channel) {
      case CHANNELS.BLOCKCHAIN:
        this.blockchain.replaceChain(parsedMessage, true, () => {
          this.transactionPool.clearBlockChainTransactions({
            chain: parsedMessage,
          });
        });
        break;
      case CHANNELS.TRANSACTION:
        this.transactionPool.setTransaction(parsedMessage);
        break;
      default:
        break;
    }
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach((channel) => {
      this.subscriber.subscribe(channel);
    });
  }

  publish({ channel, message }) {
    this.subscriber.unsubscribe(channel, () => {
      this.publisher.publish(channel, message, () => {
        this.subscriber.subscribe(channel);
      });
    });
  }

  broadcastChain() {
    // broadcast the whole chain to other chains
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain),
    });
  }

  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction),
    });
  }
}

module.exports = PubSub;
