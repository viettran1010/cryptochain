import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import "regenerator-runtime/runtime"; // import this to use async/await with parcel
import Blocks from "./Blocks";

const App = () => {
  const [wallet, setWallet] = useState({});

  useEffect(async () => {
    const res = await axios.get("http://localhost:3000/api/wallet-info");
    setWallet({ walletInfo: res.data });
  }, []);

  return (
    <div>
      Welcome to the blockchain!
      <div>Address: {wallet?.walletInfo?.address}</div>
      <div>Balance: {wallet?.walletInfo?.balance}</div>
      <br></br>
      <Blocks></Blocks>
    </div>
  );
};

export default App;
