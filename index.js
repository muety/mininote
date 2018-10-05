'use strict'

const config = require('./config'),
    express = require('express'),
    app = express(),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    port = process.env.PORT || config.PORT,
    debug = process.env.NODE_ENV === 'dev' || config.DEBUG,
    notebookRouter = require('./routers/notebook-router')


let server;

app.use(express.static('public'))
app.use(bodyParser.json())

if (debug) app.use(cors())
app.use('/api', notebookRouter);

if (config.HTTPS_KEY && config.HTTPS_CERT) {
    const https = require('https'),
        fs = require('fs'),
        path = require('path'),
        key = fs.readFileSync(path.normalize(config.HTTPS_KEY), 'utf8'),
        cert = fs.readFileSync(path.normalize(config.HTTPS_CERT), 'utf8')

    if (key && cert) {
        server = https.createServer({ key, cert }, app)
    }
}

if (!server) {
    const http = require('http')
    server = http.createServer(app)
}

server.listen(port, () => {
    console.log(`Listening on localhost:${port}.`)
})