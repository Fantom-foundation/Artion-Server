require("dotenv").config();
const ethUtil = require("ethereumjs-util");
const sigUtil = require("eth-sig-util");

const mongoose = require("mongoose");
const Account = mongoose.model("Account");

const toLowerCase = require("../../utils/utils");

const validateSignature = async (publicKey, signature, retrievedAddr) => {
  try {
    publicKey = toLowerCase(publicKey);
    retrievedAddr = toLowerCase(retrievedAddr);
    let account = await Account.findOne({ address: publicKey });
    let nonce = account.nonce;
    let msg = `Approve Signature on Artion.io with nonce ${nonce}`;
    let msgBufferHex = ethUtil.bufferToHex(Buffer.from(msg, "utf8"));
    let address = sigUtil.recoverPersonalSignature({
      data: msgBufferHex,
      sig: signature,
    });
    if (toLowerCase(address) == publicKey) {
      account.nonce = Math.floor(Math.random() * 9999999);
      await account.save();
      return true;
    } else if (toLowerCase(address) == retrievedAddr) {
      account.nonce = Math.floor(Math.random() * 9999999);
      await account.save();
      return true;
    } else return false;
  } catch (error) {
    return false;
  }
};

module.exports = validateSignature;
