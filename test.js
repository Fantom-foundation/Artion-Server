const isUrlExists = require("url-exists-nodejs");

const a = async () => {
  let ifValid = await isUrlExists("https://google.com");
  console.log(ifValid);
};

a();
