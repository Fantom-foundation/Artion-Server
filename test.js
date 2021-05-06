const { includes } = require("./constants/simplifiederc1155abi");

a = 2;

let b = {
  ...(a === 2 ? { aa: 1 } : { bb: 1 }),
};

console.log(b);
test = [];
test.in