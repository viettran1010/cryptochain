import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "regenerator-runtime/runtime"; // import this to use async/await with parcel
import Transaction from "./Transaction";

const TransactionPool = () => {
  const [transactionPoolMap, setTransactionPoolMap] = useState({});
  const fetchTransactionPoolMap = async () => {
    const res = await axios.get(
      "http://localhost:3000/api/transaction-pool-map"
    );

    setTransactionPoolMap(res.data);
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
    </div>
  );
};

export default TransactionPool;
