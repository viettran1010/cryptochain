import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { FormGroup, FormControl, Button } from "react-bootstrap";
import "regenerator-runtime/runtime"; // import this to use async/await with parcel
import axios from "axios";

const ConductTransaction = () => {
  const [recipient, setRecipient] = useState("any-recipient");
  const [amount, setAmount] = useState(100);
  const history = useHistory();

  const updateRecipient = (event) => {
    setRecipient(event.target.value);
  };

  const updateAmount = (event) => {
    setAmount(Number(event.target.value));
  };

  const conductTransaction = async () => {
    await axios.post("http://localhost:3000/api/transact", {
      recipient,
      amount,
    });
    history.push("/transaction-pool");
  };

  return (
    <div>
      <Link to="/">Home</Link>
      <h3>Conduct a transaction</h3>
      <FormGroup>
        <FormControl
          input="text"
          placeholder="recipient"
          value={recipient}
          onChange={updateRecipient}
        ></FormControl>
      </FormGroup>
      <FormGroup>
        <FormControl
          input="number"
          placeholder="amount"
          value={amount}
          onChange={updateAmount}
        ></FormControl>
      </FormGroup>
      <div>
        <Button onClick={conductTransaction}>Submit</Button>
      </div>
    </div>
  );
};

export default ConductTransaction;
