'use strict';

const test = require('tape');
const express = require('express');
const request = require('supertest');

test('POST: /api/notebook creates a new note', async (t) => {
  const app = require('../index');
  const newNote = {
    id: 'Test',
    password: 'Zoinks123'
  };

  request(app)
    .post('/api/notebook')
    .send(newNote)
    .expect(201)
    .end((err, res) => {
      const actualNote = res.body;
      t.equals(actualNote, newNote, 'Created the note');
    });

    t.end();
});
