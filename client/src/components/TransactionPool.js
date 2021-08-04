import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import "regenerator-runtime/runtime"; // import this to use async/await with parcel
import Transaction from "./Transaction";
import { Button } from "react-bootstrap";

const TransactionPool = () => {
  const [transactionPoolMap, setTransactionPoolMap] = useState({});
  const history = useHistory();
  const fetchTransactionPoolMap = async () => {
    const res = await axios.get(
      `${document.location.origin}/api/transaction-pool-map`
    );

    setTransactionPoolMap(res.data);
  };

  const fetchMineTransactions = async () => {
    const res = await axios.get(
      `${document.location.origin}/api/mine-transactions`
    );
    console.dir(res);
    if (res.status === 200) {
      alert("Mine transaction successful");
      history.push("/blocks");
    } else {
      alert("Mine transaction error!", res.status);
    }
  };

  useEffect(() => {
    fetchTransactionPoolMap();
  }, []);

  return (
    <div>
      <div>
        <Link to="/">Home</Link>
      </div>
      <h3>Transactions Pool</h3>
      {Object.values(transactionPoolMap).map((transaction) => (
        <div key={transaction.id}>
          <hr></hr>
          <Transaction
            input={transaction.input}
            outputMap={transaction.outputMap}
          ></Transaction>
        </div>
      ))}
      <Button onClick={fetchMineTransactions}>Mine Transactions</Button>
    </div>
  );
};

export default TransactionPool;
