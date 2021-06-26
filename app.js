const express = require('express')
const app = express()
const path = require('path')
const fetch = require('node-fetch')
const PORT = process.env.PORT || 8000; // process.env accesses heroku's environment variables
const fs = require("fs");

app.use('/public', express.static('public'))

app.get('/', (request, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'))
})

app.get('/words', (request, res) => {
  res.send(fs.readFileSync("./public/words.txt", "utf-8").split("\n"))
})

app.listen(PORT, () => {
  console.log(__dirname);
  console.log(`listening on ${PORT}`)
})