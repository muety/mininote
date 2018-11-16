"use strict";

const config = require("../config"),
  lfsa = require("../node_modules/lokijs/src/loki-fs-structured-adapter"),
  loki = require("lokijs"),
  db = new loki(config.DB_FILE, {
    adapter: new lfsa(),
    autoload: true,
    autoloadCallback: initDb,
    autosave: true,
    autosaveInterval: 4000
  });

let notebooks;

function initDb() {
  if (!db.getCollection(config.DB_COLLECTION_MAIN))
    db.addCollection(config.DB_COLLECTION_MAIN);
  notebooks = db.getCollection(config.DB_COLLECTION_MAIN);
}

exports.exist = (req, res) => {
  if (!notebooks.findOne({ id: req.params.id })) return res.status(404).end();
  res.status(200).end();
};

exports.create = (req, res) => {
  if (!req.body || !req.body.id || !req.body.password)
    return res.status(400).end();
  if (notebooks.findOne({ id: req.body.id })) return res.status(409).end();

  let notebook = notebooks.insert({
    id: req.body.id,
    password: req.body.password,
    notes: []
  });
  if (notebook) return res.status(201).send(notebook);
  else return res.status(500).end();
};

exports.getNotes = (req, res) => {
  let notebook = notebooks.findOne({ id: req.params.id });
  if (!notebook) return res.status(404).end();
  if (req.get("Authorization") !== `Basic ${notebook.password}`)
    return res.status(401).end();
  res.send(notebook.notes);
};

exports.updateNotes = (req, res) => {
  if (!req.body || !Array.isArray(req.body)) return res.status(400).end();
  let notebook = notebooks.findOne({ id: req.params.id });
  if (!notebook) return res.status(404).end();
  if (req.get("Authorization") !== `Basic ${notebook.password}`)
    return res.status(401).end();
  notebook.notes = req.body;
  notebooks.update(notebook);
  res.send(notebook.notes);
};

exports.updateSettings = (req, res) => {
  if (!req.body) return res.status(400).end();
  let notebook = notebooks.findOne({ id: req.params.id });
  if (!notebook) return res.status(404).end();
  if (req.get("Authorization") !== `Basic ${notebook.password}`)
    return res.status(401).end();

  if (req.body.password) {
    notebook.password = req.body.password;
  }
  notebooks.update(notebook);
  res.send(notebook.notes);
};
