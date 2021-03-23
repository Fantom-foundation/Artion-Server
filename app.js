const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const port = 5000

app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
)
app.use(bodyParser.json())
app.options('*', cors()) // include before other routes
app.use(cors())
app.use(require('./apis'))

app.listen(port, () => {
  console.log(`App is running at port ${port}`)
})
