const express = require('express');
const Blockchain = require('./blockchain');

const app = express();
const blockChain = new Blockchain();

app.get('/api/blocks', (req,res)=> {
    res.json(blockChain.chain)
})

const PORT = 3000;
app.listen(PORT, ()=> {
    console.log(`listening at port ${PORT}`);
})