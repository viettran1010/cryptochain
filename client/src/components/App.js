import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import "regenerator-runtime/runtime"; // import this to use async/await with parcel
import { Link } from "react-router-dom";

const App = () => {
  const [wallet, setWallet] = useState({});

  useEffect(async () => {
    const res = await axios.get("http://localhost:3000/api/wallet-info");
    setWallet({ walletInfo: res.data });
  }, []);

  return (
    <div>
      Welcome to the blockchain!
      <br></br>
      <div>
        <Link to="/blocks">Blocks</Link>
      </div>
      <div>
        <Link to="/conduct-transaction">Conduct Transaction</Link>
      </div>
      <div>
        <Link to="/transaction-pool">Transaction Pool</Link>
      </div>
      <br></br>
      <div>Address: {wallet?.walletInfo?.address}</div>
      <div>Balance: {wallet?.walletInfo?.balance}</div>
      <br></br>
    </div>
  );
};

export default App;
