const express = require("express");
const Blockchain = require("./blockchain");
const request = require("request");
const path = require("path");
const bodyParser = require("body-parser");
const PubSub = require("./app/pubsub");
const TransactionPool = require("./wallet/transaction-pool");
const Wallet = require("./wallet");
const TransactionMiner = require("./app/transaction-miner");
const cors = require("cors");

const isDevelopment = process.env.ENV === "development";

// const REDIS_URL = "redis://127.0.0.1:6379";
const REDIS_URL = "redis://64.225.91.48:6379";
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool, redisUrl: REDIS_URL });
const transactionMiner = new TransactionMiner({
  blockchain,
  transactionPool,
  wallet,
  pubsub,
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "client/dist"))); //to serve files, not just html
app.use(cors());

app.get("/api/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.post("/api/mine", (req, res) => {
  const { data } = req.body;

  blockchain.addBlock({ data });

  pubsub.broadcastChain();

  res.redirect("/api/blocks");
});

app.post("/api/transact", (req, res) => {
  const { amount, recipient } = req.body;

  let transaction = transactionPool.existingTransaction({
    inputAddress: wallet.publicKey,
  });
  try {
    if (transaction) {
      transaction.update({ senderWallet: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({
        recipient,
        amount,
        chain: blockchain.chain,
      });
    }
  } catch (error) {
    return res.status(400).json({ type: "error", message: error.message });
  }

  transactionPool.setTransaction(transaction);

  pubsub.broadcastTransaction(transaction);

  res.json({ type: "success", transaction });
});

app.get("/api/wallet-info", (req, res) => {
  res.json({
    address: wallet.publicKey,
    balance: Wallet.calculateBalance({
      chain: blockchain.chain,
      address: wallet.publicKey,
    }),
  });
});

app.get("/api/transaction-pool-map", (req, res) => {
  res.json(transactionPool.transactionMap);
});

app.get("/api/mine-transactions", (req, res) => {
  transactionMiner.mineTransactions();
  res.redirect("/api/blocks");
});

/**
 * Provide client
 */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/src/index.html"));
});

const syncWithRootState = () => {
  request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (err, response, body) => {
    if (!err && response.statusCode === 200) {
      const rootChain = JSON.parse(body);

      console.log("replace chain on a sync with ", rootChain);
      blockchain.replaceChain(rootChain);
    }
  });

  request(
    { url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` },
    (err, response, body) => {
      if (!err && response.statusCode === 200) {
        const rootTransactionPoolMap = JSON.parse(body);

        console.log(
          "replace transaction map on a sync with ",
          rootTransactionPoolMap
        );
        transactionPool.setMap(rootTransactionPoolMap);
      }
    }
  );
};

if (isDevelopment) {
  const wallet1 = new Wallet();
  const wallet2 = new Wallet();

  const generateWalletTransactions = ({ wallet, recipient, amount }) => {
    const transaction = wallet.createTransaction({
      recipient,
      amount,
      chain: blockchain.chain,
    });

    transactionPool.setTransaction(transaction);
  };

  const walletAction = () => {
    generateWalletTransactions({
      wallet,
      recipient: wallet1.publicKey,
      amount: 5,
    });
  };

  const wallet1Action = () => {
    generateWalletTransactions({
      wallet: wallet1,
      recipient: wallet2.publicKey,
      amount: 10,
    });
  };

  const wallet2Action = () => {
    generateWalletTransactions({
      wallet: wallet2,
      recipient: wallet.publicKey,
      amount: 15,
    });
  };

  for (let i = 0; i < 10; i++) {
    if (i % 3 === 0) {
      walletAction();
      wallet1Action();
    } else if (i % 3 === 1) {
      walletAction();
      wallet2Action();
    } else {
      wallet1Action();
      wallet2Action();
    }

    transactionMiner.mineTransactions();
  }
}

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log(`listening at port ${PORT}`);
  if (PORT !== DEFAULT_PORT) syncWithRootState();
});
