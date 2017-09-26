'use strict'

const config = require('./config'),
    express = require('express'),
    app = express(),
    port = process.env.PORT || config.PORT

app.use(express.static('public'))

app.listen(port, () => {
    console.log(`Listening on port ${port}.`)
})