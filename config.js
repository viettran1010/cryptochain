const INITIAL_DIFFICULTY = 3; //set it low so it would be quick for dev
const MINE_RATE = 1000; //one sec
const GENESIS_DATA = {
  timestamp: 1,
  lastHash: "-----",
  hash: "hash-one",
  data: [],
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
};

const STARTING_BALANCE = 1000;

// standard input for miner reward
const REWARD_INPUT = {
  address: "*authorized-reward*",
};

const MINING_REWARD = 50;

module.exports = {
  GENESIS_DATA,
  MINE_RATE,
  STARTING_BALANCE,
  REWARD_INPUT,
  MINING_REWARD,
};
