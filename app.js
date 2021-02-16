const express = require('express')
const app = express()
const port = 3000

app.use(require('./apis'))

app.listen(port, () => {
  console.log(`App is running at port ${port}`)
})
