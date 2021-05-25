const ethers = require("ethers");

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

  let history = [];
  evts.map((evt) => {
    let from = extractAddress(evt.topics[1]);
    let to = extractAddress(evt.topics[2]);
    history.push([from, to]);
  });
  console.log(history);
  return history;
};

fetchTransferHistory();
