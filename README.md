# cryptochain
Overview:
- This is a simple version of a blockchain system.
- Each instance contains a blockchain consists of blocks.
- Each block has information of timestamp, hash, lastHash, and data.
- Data of block contains a list of successful transactions.

Mining:
- When mining, nonce, SHA-256 and dynamic difficulty are used.
- After a sucessful mining, a block will be added to the blockchain and synced to other instances.
- Syncing process is done through redis-server's pubsub.

Wallet:
- Has balance info and is calculated based on current blockchain.
- Contains public/private key pair for signing/verifying data, and wallet's address.

Transaction pool:
- Contains a list of transactions waiting to be mined.
- When a node's blockchain is replaced due to synchronization, only corresponding transactions will be removed from its transaction pool. So the remaining transactions can be mined later.

Technical facts and limitations:
- This project is written on TDD style using Jest.
- It's deployed on Heroku. I had some problem registering my credit card so I could not use heroku's redis-server addon. So I hosted a redis-server on Digital Ocean but haven't tested yet.
- Server is using Nodejs and Express (I use node 14).
- The front-end is a bare minimum Reactjs app with React router, hooks. There is no styling because of time shortage and the focus here is on the server and logic.
- Bundling tool for front-end is Parcel for its ease of use (nearly zero config).
- There's no smart contract.

How to run:
- On local: npm i && npm run dev 
- On prod: https://pure-beyond-61034.herokuapp.com/#/
- For testing: npm run test
