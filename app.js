const express = require("express");
const app = express();
const cors = require("cors");
const port = 5000;

app.use(cors());
app.use(require("./apis"));

app.listen(port, () => {
  console.log(`App is running at port ${port}`);
});
