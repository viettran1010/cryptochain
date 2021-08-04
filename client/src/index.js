import React from "react";
import { render } from "react-dom";
import App from "./components/App";
import history from "./history";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import Blocks from "./components/Blocks";
import ConductTransaction from "./components/ConductTransaction";
import TransactionPool from "./components/TransactionPool";

render(
  <div>
    Welcome to the blockchain!
    <br />
    What you can do:
    <br />
    - Conduct transaction: <br />+ Click on <u>Conduct transaction</u>
    <br />+ Choose any recipient, amount and click <u>Submit</u>
    <br />+ You will be redirected to transaction pool. Click{" "}
    <u>Mine Transactions</u> to mine and add a block to the block chain which
    contains all transactions being mined
    <br />
    <Router history={history}>
      <Switch>
        <Route
          path="/conduct-transaction"
          component={ConductTransaction}
        ></Route>
        <Route path="/blocks" component={Blocks}></Route>
        <Route path="/transaction-pool" component={TransactionPool}></Route>
        <Route path="/" component={App} />
      </Switch>
    </Router>
  </div>,
  document.getElementById("root")
);
