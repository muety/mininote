'use strict'

const config = require('../config'),
    lfsa = require('lokijs/src/loki-fs-structured-adapter'),
    loki = require('lokijs'),
    db = new loki(config.DB_FILE, {
        adapter: new lfsa(),
        autoload: true,
        autoloadCallback: initDb,
        autosave: true,
        autosaveInterval: 10000
  })

let notebooks

function initDb() {
    if (!db.getCollection(config.DB_COLLECTION_MAIN)) {
        db.addCollection(config.DB_COLLECTION_MAIN)
    }
    notebooks = db.getCollection(config.DB_COLLECTION_MAIN)
}

exports.exist = (req, res) => {
    if (!notebooks.findOne({ id: req.params.id })) return res.status(404).end()
    return res.status(200).end()
}

exports.create = (req, res) => {
    if (!req.body || !req.body.id || !req.body.password) return res.status(400).end()
    if (notebooks.findOne({ id: req.body.id })) return res.status(409).end()

    let notebook = notebooks.insert({
        id: req.body.id,
        password: req.body.password,
        notes: []
    })
    
    if (notebook) return res.status(201).send(notebook)
    return res.status(500).end()
}

exports.update = (req, res) => {
    let notebook = notebooks.findOne({ id: req.params.id })
    if (!notebook) return res.status(404).end()
    if (req.get('Authorization') !== `Basic ${notebook.password}`) return res.status(401).end()

    if (notebooks.findOne({ id: req.body.id })) return res.status(409).end()

    if (req.body.id) notebook.id = req.body.id
    if (req.body.password) notebook.password = req.body.password
    notebooks.update(notebook)

    return res.status(200).end()
}

exports.delete = (req, res) => {
    let notebook = notebooks.findOne({ id: req.params.id })
    if (!notebook) return res.status(404).end()
    if (req.get('Authorization') !== `Basic ${notebook.password}`) return res.status(401).end()

    notebooks.remove(notebook)

    return res.status(200).end()
}

exports.getNotes = (req, res) => {
    let notebook = notebooks.findOne({ id: req.params.id })
    if (!notebook) return res.status(404).end()
    if (req.get('Authorization') !== `Basic ${notebook.password}`) return res.status(401).end()
    
    return res.send(notebook.notes)
}

exports.addNote = (req, res) => {
    let notebook = notebooks.findOne({ id: req.params.id })
    if (!notebook) return res.status(404).end()
    if (req.get('Authorization') !== `Basic ${notebook.password}`) return res.status(401).end()

    let newId = notebook.notes.reduce((acc, n) => Math.max(acc, n.id), 0) + 1
    notebook.notes.push({
        id: newId,
        title: req.body.title,
        content: req.body.content
    })
    notebooks.update(notebook)

    return res.status(201).send({ id: newId })
}

exports.updateNote = (req, res) => {
    let notebook = notebooks.findOne({ id: req.params.id })
    if (!notebook) return res.status(404).end()
    if (req.get('Authorization') !== `Basic ${notebook.password}`) return res.status(401).end()

    let note = notebook.notes.find(n => n.id == req.params.noteId)
    if (!note) return res.status(404).end()

    note.title = req.body.title
    note.content = req.body.content
    notebooks.update(notebook)

    return res.status(200).end()
}

exports.deleteNote = (req, res) => {
    let notebook = notebooks.findOne({ id: req.params.id })
    if (!notebook) return res.status(404).end()
    if (req.get('Authorization') !== `Basic ${notebook.password}`) return res.status(401).end()

    let noteIdx = notebook.notes.findIndex(n => n.id == req.params.noteId)
    if (noteIdx < 0) return res.status(404).end()

    notebook.notes.splice(noteIdx, 1)
    notebooks.update(notebook)

    return res.status(200).end()
}
