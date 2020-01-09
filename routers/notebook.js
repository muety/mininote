'use strict'

const express = require('express'),
    router = express.Router(),
    notebookController = require('../controllers/notebook')

router.post('/notebook', notebookController.create)

router.head('/notebook/:id', notebookController.exist)

router.put('/notebook/:id', notebookController.update)

router.delete('/notebook/:id', notebookController.delete)

router.get('/notebook/:id/notes', notebookController.getNotes)

router.post('/notebook/:id/notes', notebookController.addNote)

router.put('/notebook/:id/notes/:noteId', notebookController.updateNote)

router.delete('/notebook/:id/notes/:noteId', notebookController.deleteNote)

router.put('/notebook/:id/settings', notebookController.updateSettings)

module.exports = router
