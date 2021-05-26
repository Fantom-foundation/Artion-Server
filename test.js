const ethers = require("ethers");
const axios = require("axios");

let address = "0xb6D6Daf7859E1647DA1ccA631035f00Ea8E790e2";
let rpc = "https://rpc.fantom.network";
let chainID = 250;
const provider = new ethers.providers.JsonRpcProvider(rpc, chainID);

const extractAddress = (data) => {
  let length = data.length;
  return data.substring(0, 2) + data.substring(length - 40);
};

const fetchTransferHistory = async () => {
  let evts = await provider.getLogs({
    address: address,
    fromBlock: 0,
    topics: [
      ethers.utils.id(
        // "TransferSingle(address,address,address,uint256,uint256)"
        "TransferBatch(address,address,address,uint256[],uint256[])"
      ),
      null,
      null,
      null,
      //   ethers.utils.hexZeroPad(1, 32),
      null,
      null,
    ],
  });
  console.log(evts);

  let history = [];
  evts.map((evt) => {
    let from = extractAddress(evt.topics[1]);
    let to = extractAddress(evt.topics[2]);
    history.push([from, to]);
  });
  //   console.log(history);
  return history;
};

const test = async () => {
  let res = await axios.get(
    "https://gateway.pinata.cloud/ipfs/QmUr3mWjENsYhADFN8PPPqojjj2RALuUEtMfcSkMLCanJZ/puppy_data/2.json"
  );
  let name = res.data.name;
  console.log(name);
};

// test();
// fetchTransferHistory();

const blockTest = async () => {
  let block = await provider.getBlock(6946024);
  let blockTime = block.timestamp;
  blockTime = new Date(blockTime * 1000);
  console.log(blockTime);
};

blockTest();
