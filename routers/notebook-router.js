'use strict'

const config = require('../config'),
    lfsa = require('../node_modules/lokijs/src/loki-fs-structured-adapter'),
    loki = require('lokijs'),
    db = new loki(config.DB_FILE, {
        adapter: new lfsa(),
        autoload: true,
        autoloadCallback: initDb,
        autosave: true,
        autosaveInterval: 4000
    })

let notebooks;

function initDb() {
    if (!db.getCollection(config.DB_COLLECTION_MAIN)) db.addCollection(config.DB_COLLECTION_MAIN)
    notebooks = db.getCollection(config.DB_COLLECTION_MAIN)
}

const express = require('express'),
    router = express.Router();


router.head('/notebook/:id', (req, res) => {
    if (!notebooks.findOne({ id: req.params.id })) return res.status(404).end()
    res.status(200).end()
})

router.post('/notebook', (req, res) => {
    if (!req.body || !req.body.id || !req.body.password) return res.status(400).end()
    if (notebooks.findOne({ id: req.body.id })) return res.status(409).end()

    let notebook = notebooks.insert({ id: req.body.id, password: req.body.password, notes: [] })
    if (notebook) return res.status(201).send(notebook)
    else return res.status(500).end()
})

router.get('/notebook', (req, res) => {
  if (config.SHOW_LIST) {
    res.status(200).send(notebooks.find().map(notebookData => notebookData.id))
  } else {
    res.status(204).send(notebooks.count())
  }
})

router.get('/notebook/:id/notes', (req, res) => {
    let notebook = notebooks.findOne({ id: req.params.id })
    if (!notebook) return res.status(404).end()
    if (req.get('Authorization') !== `Basic ${notebook.password}`) return res.status(401).end()
    res.send(notebook.notes)
})

router.put('/notebook/:id/notes', (req, res) => {
    if (!req.body || !Array.isArray(req.body)) return res.status(400).end()
    let notebook = notebooks.findOne({ id: req.params.id })
    if (!notebook) return res.status(404).end()
    if (req.get('Authorization') !== `Basic ${notebook.password}`) return res.status(401).end()
    notebook.notes = req.body
    notebooks.update(notebook)
    res.send(notebook.notes)
})

router.put('/notebook/:id/settings', (req, res) => {
    if (!req.body) return res.status(400).end()
    let notebook = notebooks.findOne({ id: req.params.id })
    if (!notebook) return res.status(404).end()
    if (req.get('Authorization') !== `Basic ${notebook.password}`) return res.status(401).end()

    if (req.body.password) {
        notebook.password = req.body.password;
    }
    notebooks.update(notebook)
    res.send(notebook.notes)
})

router.get('/notebook/:id/:name', (req, res) => {
  let notebook = notebooks.findOne({ id: req.params.id })
  if (!notebook) return res.status(404).end()
  if (req.get('Authorization') !== `Basic ${notebook.password}`) return res.status(401).end()
  let note = notebook.notes.find(n => n.id == req.params.name)
  if (!note) return res.status(404).end()
  res.send(note)
})

router.post('/notebook/:id/:name', (req, res) => {
  if (!req.body || !(typeof req.body === 'object')) return res.status(400).end()
  let notebook = notebooks.findOne({ id: req.params.id })
  if (!notebook) return res.status(404).end()
  if (req.get('Authorization') !== `Basic ${notebook.password}`) return res.status(401).end()
  let id = Math.max(...notebook.notes.map(o => o.id), 0) + 1
  notebook.notes.push({
    id,
    title: req.params.name,
    content: '',
  })
  notebooks.update(notebook)
  res.send({ notes: notebook.notes, createdId: id })
})

router.put('/notebook/:id/:name', (req, res) => {
  if (!req.body || !(typeof req.body === 'object')) return res.status(400).end()
  let notebook = notebooks.findOne({ id: req.params.id })
  if (!notebook) return res.status(404).end()
  if (req.get('Authorization') !== `Basic ${notebook.password}`) return res.status(401).end()
  let note = notebook.notes.find(note => note.id == req.params.name)
  if (!note) return res.status(404).end()
  // update
  note.content = req.body.content
  notebooks.update(notebook)
  res.send(note)
})

router.delete('/notebook/:id/:name', (req, res) => {
  let notebook = notebooks.findOne({ id: req.params.id })
  if (!notebook) return res.status(404).end()
  if (req.get('Authorization') !== `Basic ${notebook.password}`) return res.status(401).end()
  let newNotesArr = notebook.notes.filter(note => note.id != req.params.name)
  notebook.notes = newNotesArr
  notebooks.update(notebook)
  res.status(200).end()
})

module.exports = router;
