import React, { useState } from "react";
import Transaction from "./Transaction";
import "./styles.css";

const Block = ({ timestamp, hash, data }) => {
  const [displayTransaction, setDisplayTransaction] = useState(false);

  const toggleTransaction = () => {
    setDisplayTransaction(!displayTransaction);
  };

  return (
    <div className="block">
      <div>Hash: {hash.substring(0, 15)}</div>
      <div>Time: {new Date(timestamp).toDateString()}</div>
      <button onClick={toggleTransaction}>Show more</button>
      {displayTransaction &&
        data.map((transaction) => (
          <div key={transaction.id}>
            <br></br>
            <Transaction {...transaction}></Transaction>
          </div>
        ))}
    </div>
  );
};

export default Block;
