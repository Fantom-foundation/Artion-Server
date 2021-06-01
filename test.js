const ethers = require("ethers");
const axios = require("axios");
const orderBy = require("lodash.orderby");
const toLowerCase = require("./utils/utils");

let address = "0xb6D6Daf7859E1647DA1ccA631035f00Ea8E790e2";
let rpc = "https://rpc.fantom.network";
let chainID = 250;
const provider = new ethers.providers.JsonRpcProvider(rpc, chainID);

const extractAddress = (data) => {
  let length = data.length;
  return data.substring(0, 2) + data.substring(length - 40);
};

const getBlockTime = async (blockNumber) => {
  let block = await provider.getBlock(blockNumber);
  let blockTime = block.timestamp;
  blockTime = new Date(blockTime * 1000);
  return blockTime;
};

const parseSingleTrasferData = (data) => {
  return [
    parseInt(data.substring(0, 66), 16),
    parseInt(data.substring(66), 16),
  ];
};

const parseBatchTransferData = (data) => {
  let tokenIDs = [];
  data = data.substring(2);
  let segments = data.length / 64;
  let tkCount = segments / 2;
  let tkData = data.substring(64 * 3, 64 * (tkCount + 1));
  for (let i = 0; i < tkData.length / 64; ++i) {
    let _tkData = tkData.substring(i * 64, (i + 1) * 64);
    let tokenID = parseInt(_tkData.toString(), 16);
    tokenIDs.push(tokenID);
  }
  return tokenIDs;
};

const fetchTransferHistory = async (address, id) => {
  let singleTransferEvts = await provider.getLogs({
    address: address,
    fromBlock: 0,
    topics: [
      ethers.utils.id(
        "TransferSingle(address,address,address,uint256,uint256)"
      ),
      null,
      null,
      null,
      null,
      null,
    ],
  });
  // console.log(singleTransferEvts);
  let batchTransferEvts = await provider.getLogs({
    address: address,
    fromBlock: 0,
    topics: [
      ethers.utils.id(
        "TransferBatch(address,address,address,uint256[],uint256[])"
      ),
      null,
      null,
      null,
      null,
      null,
    ],
  });

  let history = [];

  // process single transfer event logs
  let singplePromise = singleTransferEvts.map(async (evt) => {
    let data = evt.data;
    let topics = evt.topics;
    let blockNumber = evt.blockNumber;
    let blockTime = await getBlockTime(blockNumber);
    data = parseSingleTrasferData(data);
    let tokenID = data[0];
    let tokenTransferValue = data[1];
    let from = toLowerCase(extractAddress(topics[2]));
    let to = toLowerCase(extractAddress(topics[3]));
    if (parseInt(tokenID) == parseInt(id))
      history.push({
        from,
        to,
        blockTime,
        tokenID,
        // value: tokenTransferValue,
      });
  });
  await Promise.all(singplePromise);

  let batchPromise = batchTransferEvts.map(async (evt) => {
    let data = evt.data;
    let topics = evt.topics;
    let from = toLowerCase(extractAddress(topics[2]));
    let to = toLowerCase(extractAddress(topics[3]));
    let tokenIDs = parseBatchTransferData(data);
    let blockNumber = evt.blockNumber;
    let blockTime = await getBlockTime(blockNumber);
    tokenIDs.map((tokenID) => {
      if (parseInt(tokenID) == parseInt(id))
        history.push({
          from,
          to,
          blockTime,
          tokenID,
        });
    });
  });
  await Promise.all(batchPromise);
  // process batch transfer event logs
  let _history = orderBy(history, "blockTime", "asc");
  return _history;
};

// fetchTransferHistory("0xb6d6daf7859e1647da1cca631035f00ea8e790e2", 1);

const arr = [
  ["123", 1],
  ["234", 2],
  ["123", 1],
];
let test = arr.filter(((t = {}), (a) => !(t[a] = a in t)));

console.log(test);
