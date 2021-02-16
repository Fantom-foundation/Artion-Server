const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Nifty Backend server!')
})

app.listen(port, () => {
  console.log(`App is running at port ${port}`)
})
