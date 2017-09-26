'use strict'

const config = require('./config'),
    express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    port = process.env.PORT || config.PORT

const notebooks = {
    nb1: {
        password: 'acbd18db4cc2f85cedef654fccc4a4d8',
        notes: [{ "id": 1, "title": "Ubb", "content": "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet." }, { "id": 2, "title": "JU Main Tauber", "content": "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet." }]
    }
}

app.use(express.static('public'))
app.use(bodyParser.json())

app.head('/api/notebook/:id', (req, res) => {
    if (!notebooks.hasOwnProperty(req.params.id)) return res.status(404).end()
    res.status(200).end()
})

app.post('/api/notebook', (req, res) => {
    if (!req.body || !req.body.id || !req.body.password) return res.status(400).end()
    if (notebooks.hasOwnProperty(req.body.id)) return res.status(409).end()

    notebooks[req.body.id] = { password: req.body.password, notes: [] }
    return res.status(201).send(notebooks[req.body.id])
})

app.get('/api/notebook/:id/notes', (req, res) => {
    if (!notebooks.hasOwnProperty(req.params.id)) return res.status(404).end()
    if (req.get('Authorization') !== `Basic ${notebooks[req.params.id].password}`) return res.status(401).end()
    res.send(notebooks[req.params.id].notes)
})

app.put('/api/notebook/:id/notes', (req, res) => {
    if (!req.body || !Array.isArray(req.body)) return res.status(400).end()
    if (!notebooks.hasOwnProperty(req.params.id)) return res.status(404).end()
    if (req.get('Authorization') !== `Basic ${notebooks[req.params.id].password}`) return res.status(401).end()
    notebooks[req.params.id].notes = req.body
    return res.send(notebooks[req.params.id].notes)
})

app.listen(port, () => {
    console.log(`Listening on port ${port}.`)
})