import React from "react";
import { render } from "react-dom";
import App from "./components/App";
import history from "./history";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import Blocks from "./components/Blocks";

render(
  <Router history={history}>
    <Switch>
      <Route path="/blocks" component={Blocks}></Route>
      <Route path="/" component={App} />
    </Switch>
  </Router>,
  document.getElementById("root")
);
