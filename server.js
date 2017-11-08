var path = require('path')
var fs = require('fs')
var express = require('express')
var cors = require('cors')
const bodyParser = require('body-parser') // parse the http header to get the payload

var app = express()
app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true, limit: '5mb'}))

app.use(express.static(__dirname))

app.post('/api/download/shader', downloadJSON)

function downloadJSON (req, res) {
  // fs.createReadStream(process.argv[3]).pipe(res)
  // console.log('downloadJSON')
  console.log('downloadJSON', req.body)
  let filePath = req.body.filePath
  fs.readFile(path.resolve(__dirname, filePath), 'utf8', (err, data) => {
    if (err) {
      console.log('download err', err)
      res.writeHead(500)
      res.status = 'fail'
      res.end()
    }
    // console.log('data', data)
    res.status = 'success'
    res.send(data)
  })
}

app.listen(process.argv[2], () => { console.log('server listen to port', process.argv[2])})
