import Vuex from 'vuex'

import api from '../api'

import { version } from '../../package.json'

/* eslint-disable no-case-declarations */

const emptyState = {
  notebook: {},
  notebooks: [],
  changes: {
    add: [],
    delete: [],
    update: {},
  },
  selectedNoteId: -1,
  loadNotebookId: '',
  version,
}

/// GETTERS ///
function loaded(state) {
  return !!state.notebook.notes
}

function dirty(state) {
  return !!(
    state.changes.add.length ||
    state.changes.delete.length ||
    Object.keys(state.changes.update).length
  )
}

function selectedNote(state) {
  return resolveNotes(state).find((n) => n.id === state.selectedNoteId)
}

function noteById(state) {
  return (id) => resolveNotes(state).find((n) => n.id === id)
}

function resolveNotes(state) {
  let notes = []
  notes = notes.concat(state.notebook.notes || [])
  notes = notes.concat(state.changes.add)
  notes = notes.filter(
    (n1) => !state.changes.delete.some((n2) => n1.id === n2.id),
  )
  return notes
}

function currentContent(state) {
  let id = state.selectedNoteId
  if (id < 0) return ''
  if (id in state.changes.update) return state.changes.update[id].content
  const note = selectedNote(state)
  return note ? note.content : ''
}

function currentTitle(state) {
  let id = state.selectedNoteId
  if (id < 0) return ''
  if (id in state.changes.update) return state.changes.update[id].title
  const note = selectedNote(state)
  return note ? note.title : ''
}

/// MUTATIONS ///
function selectNote(state, id) {
  if (id < 0) state.selectedNoteId = -1
  let notes = resolveNotes(state)
  if (notes.some((n) => n.id === id)) {
    state.selectedNoteId = id
  }
}

function selectFirst(state) {
  let notes = resolveNotes(state)
  let id = notes.length ? notes[0].id : -1
  state.selectedNoteId = id
}

function updateUrl(state) {
  location.hash = state.notebook.id ? `#/notebook/${state.notebook.id}` : ''
}

/// STORE ///
const store = new Vuex.Store({
  state: JSON.parse(JSON.stringify(emptyState)),
  getters: {
    selectedNote,
    dirty,
    notes: resolveNotes,
    currentContent,
    currentTitle,
    loaded,
    noteById,
  },
  mutations: {
    setNotebooks(state, notebookList) {
      state.notebooks = notebookList
    },
    setNotebook(state, { id, password }) {
      state.notebook.id = id
      state.notebook.password = password
      updateUrl(state)
    },
    setNotes(state, notes) {
      state.notebook.notes = notes
    },
    addNote(state, note) {
      state.notebook.notes = state.notebook.notes.concat([note])
      if (state.selectedNoteId === note.oldId) selectNote(state, note.id)
    },
    removeNote(state, note) {
      state.notebook.notes = state.notebook.notes.filter(
        (n) => n.id !== note.id,
      )
      if (state.selectedNoteId === note.id && state.notebook.notes.length) {
        state.selectedNoteId = state.notes[0].id
      }
    },
    updateNote(state, note) {
      let notes = resolveNotes(state)
      let found = notes.find((n) => n.id === note.id)
      for (let prop in found) {
        found[prop] = note[prop]
      }
    },
    selectNote,
    selectFirst,
    setLoadNotebook(state, id) {
      state.loadNotebookId = id
    },
    addChange(state, { type, payload }) {
      switch (type) {
        case 'add':
        case 'delete':
          state.changes[type] = state.changes[type].concat([payload])
          break
        case 'update':
          const hasChange = payload.id in state.changes.update
          const originalNote = (state.notebook.notes || []).find(
            (n) => n.id === payload.id,
          )

          if (
            originalNote &&
            originalNote.content === payload.content &&
            hasChange
          ) {
            delete state.changes.update[payload.id]
          } else {
            state.changes.update[payload.id] = payload
          }
          break
      }
    },
    removeChange(state, { type, payload }) {
      switch (type) {
        case 'add':
        case 'delete':
          state.changes[type] = state.changes[type].filter(
            (n) => n.id !== payload.id,
          )
          break
        case 'update':
          delete state.changes.update[payload.id]
      }
    },
    revertChanges(state) {
      state.changes.add = []
      state.changes.delete = []

      Object.keys(state.changes.update).forEach((id) => {
        let note = (state.notebook.notes || []).find(
          (n) => n.id === parseInt(id),
        )

        if (!note) return

        let content = note.content
        note.content = ''
        note.content = content
      })

      state.changes.update = {}

      if (!resolveNotes(state).length) {
        selectFirst(state) // select none, i.e. -1
      }
    },
    reset(state) {
      for (let prop in emptyState) {
        state[prop] = JSON.parse(JSON.stringify(emptyState[prop]))
      }
      updateUrl(state)
    },
  },
  actions: {
    listNotebooks({ commit }) {
      return api.list().then((data) => commit('setNotebooks', data))
    },
    loadNotebook({ commit }, { id, password }) {
      return api
        .getNotes(id, password)
        .then((data) => commit('setNotes', data))
        .then(() => commit('setNotebook', { id, password }))
    },
    createNotebook({ commit }, { id, password }) {
      return api
        .create(id, password)
        .then((data) => commit('setNotes', data.notes))
        .then(() => commit('setNotebook', { id, password }))
    },
    updateNotebook({ state, commit }, notebook) {
      let updateNotebook = JSON.parse(JSON.stringify(notebook))
      if (notebook.id === state.notebook.id) delete updateNotebook.id
      return api
        .update(state.notebook.id, state.notebook.password, updateNotebook)
        .then(() => commit('setNotebook', notebook))
    },
    createNote({ state, commit }, note) {
      return api
        .addNote(state.notebook.id, state.notebook.password, note)
        .then((data) =>
          commit('addNote', { ...note, id: data.id, oldId: note.id }),
        )
    },
    updateNote({ state, commit }, note) {
      return api
        .updateNote(state.notebook.id, state.notebook.password, note)
        .then(() => commit('updateNote', note))
    },
    deleteNote({ state, commit }, note) {
      return api
        .deleteNote(state.notebook.id, state.notebook.password, note)
        .then(() => commit('removeNote', note))
    },
    applyChanges({ state, commit, dispatch }) {
      let promises = []

      Object.values(state.changes.update).forEach((n) => {
        let newNote = state.changes.add.find((n1) => n1.id === n.id)
        let deletedNote = state.changes.delete.find((n1) => n1.id === n.id)

        if (newNote) {
          commit('updateNote', n)
          commit('removeChange', { type: 'update', payload: n })
        } else if (deletedNote)
          commit('removeChange', { type: 'update', payload: n })
        else
          promises.push(
            dispatch('updateNote', n).then(() =>
              commit('removeChange', { type: 'update', payload: n }),
            ),
          )
      })

      state.changes.add.forEach((n) => {
        if (state.changes.delete.some((n1) => n1.id === n.id)) {
          commit('removeChange', { type: 'add', payload: n })
          commit('removeChange', { type: 'delete', payload: n })
        } else
          promises.push(
            dispatch('createNote', n).then(() =>
              commit('removeChange', { type: 'add', payload: n }),
            ),
          )
      })
      state.changes.delete.forEach((n) => {
        promises.push(
          dispatch('deleteNote', n).then(() =>
            commit('removeChange', { type: 'delete', payload: n }),
          ),
        )
      })

      return Promise.all(promises)
    },
  },
  strict: true,
})

export function useStore() {
  return store
}
