'use strict'

const config = require('./config'),
    express = require('express'),
    app = express(),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    lfsa = require('./node_modules/lokijs/src/loki-fs-structured-adapter.js'),
    loki = require('lokijs'),
    db = new loki(config.DB_FILE, {
        adapter: new lfsa(),
        autoload: true,
        autoloadCallback: initDb,
        autosave: true,
        autosaveInterval: 4000
    }),
    port = process.env.PORT || config.PORT,
    debug = process.env.NODE_ENV === 'dev' || config.DEBUG

let notebooks;

app.use(express.static('public'))
app.use(bodyParser.json())
if (debug) app.use(cors())

app.head('/api/notebook/:id', (req, res) => {
    if (!notebooks.findOne({ id: req.params.id })) return res.status(404).end()
    res.status(200).end()
})

app.post('/api/notebook', (req, res) => {
    if (!req.body || !req.body.id || !req.body.password) return res.status(400).end()
    if (notebooks.findOne({ id: req.body.id })) return res.status(409).end()

    let notebook = notebooks.insert({ id: req.body.id, password: req.body.password, notes: [] })
    if (notebook) return res.status(201).send(notebook)
    else return res.status(500).end()
})

app.get('/api/notebook/:id/notes', (req, res) => {
    let notebook = notebooks.findOne({ id: req.params.id })
    if (!notebook) return res.status(404).end()
    if (req.get('Authorization') !== `Basic ${notebook.password}`) return res.status(401).end()
    res.send(notebook.notes)
})

app.put('/api/notebook/:id/notes', (req, res) => {
    if (!req.body || !Array.isArray(req.body)) return res.status(400).end()
    let notebook = notebooks.findOne({ id: req.params.id })
    if (!notebook) return res.status(404).end()
    if (req.get('Authorization') !== `Basic ${notebook.password}`) return res.status(401).end()
    notebook.notes = req.body
    notebooks.update(notebook)
    res.send(notebook.notes)
})

app.listen(port, () => {
    console.log(`Listening on localhost:${port}.`)
})

function initDb() {
    if (!db.getCollection(config.DB_COLLECTION_MAIN)) db.addCollection(config.DB_COLLECTION_MAIN)
    notebooks = db.getCollection(config.DB_COLLECTION_MAIN)
}