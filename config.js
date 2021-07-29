const INITIAL_DIFFICULTY = 3; //set it low so it would be quick for dev

const GENESIS_DATA = {
    timestamp: 1,
    lastHash: '-----',
    hash: 'hash-one',
    data: [],
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0
}

module.exports = {GENESIS_DATA}