import React, { useState, useEffect } from "react";
import axios from "axios";
import Block from "./Block";
import "regenerator-runtime/runtime"; // import this to use async/await with parcel

const Blocks = () => {
  const [blocks, setBlocks] = useState([]);

  useEffect(async () => {
    const data = (await axios.get("http://localhost:3000/api/blocks")).data;
    setBlocks(data);
  }, []);

  return (
    <div>
      <h3>Blocks</h3>
      <div>
        {blocks.map((block) => (
          <Block
            key={block.hash}
            timestamp={block.timestamp}
            hash={block.hash}
            data={block.data}
          ></Block>
        ))}
      </div>
    </div>
  );
};

export default Blocks;
