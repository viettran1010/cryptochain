import React from "react";

const Transaction = ({ input, outputMap }) => {
  const recipients = Object.keys(outputMap);
  return (
    <div>
      <div>
        From: {input?.address.substring(0, 20)}... | Balance: {input.amount}
        {recipients.map((recipient) => (
          <div key={recipient}>
            {input.address !== recipient ? (
              <div>
                To: {`${recipient.substring(0, 20)}`} | Amount:{" "}
                {outputMap[recipient]}
              </div>
            ) : (
              <div>
                Remain in {`${recipient.substring(0, 20)}...`} | Amount:{" "}
                {outputMap[recipient]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transaction;
