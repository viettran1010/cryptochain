import React from "react";

const Transaction = ({ input, outputMap }) => {
  const recipients = Object.keys(outputMap);
  //   alert(recipients);
  return (
    <div>
      <div>
        From: {input?.address.substring(0, 20)}... | Balance: {input.amount}
        {recipients.map((recipient) => (
          <div key={recipient}>
            To: {`${recipient.substring(0, 20)}...`} | Sent:{" "}
            {outputMap[recipient]}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transaction;
