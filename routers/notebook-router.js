'use strict';

const express = require('express'),
    router = express.Router();

const notebookController = require('../controllers/NotebookController');

router.head('/notebook/:id', notebookController.exist);

router.post('/notebook', notebookController.create);

router.get('/notebook/:id/notes', notebookController.getNotes);

router.put('/notebook/:id/notes', notebookController.updateNotes);

router.put('/notebook/:id/settings', notebookController.updateSettings);

module.exports = router;
