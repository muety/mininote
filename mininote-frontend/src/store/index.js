import Vue from 'vue'
import Vuex from 'vuex'

import api from '../api'

Vue.use(Vuex)

const emptyState = {
    notebook: {},
    notebooks: [],
    changes: {
        add: [],
        delete: [],
        update: {}
    },
    selectedNoteId: -1,
    loadNotebookId: '',
    version: require('../../package.json').version
}

/// GETTERS ///
function loaded(state) {
    return state.notebook.hasOwnProperty('notes')
}

function dirty(state) {
    return !!(state.changes.add.length || state.changes.delete.length || Object.keys(state.changes.update).length)
}

function selectedNote(state) {
    return resolveNotes(state).find(n => n.id === state.selectedNoteId)
}

function noteById(state) {
    return (id) => resolveNotes(state).find(n => n.id === id)
}

function resolveNotes(state) {
    let notes = []
    notes = notes.concat(state.notebook.notes || [])
    notes = notes.concat(state.changes.add)
    notes = notes.filter(n1 => !state.changes.delete.some(n2 => n1.id === n2.id))
    return notes
}

function currentContent(state) {
    let id = state.selectedNoteId
    if (id < 0) return ''
    if (state.changes.update.hasOwnProperty(id)) return state.changes.update[id].content
    return selectedNote(state).content
}

function currentTitle(state) {
    let id = state.selectedNoteId
    if (id < 0) return ''
    if (state.changes.update.hasOwnProperty(id)) return state.changes.update[id].title
    return selectedNote(state).title
}

/// MUTATIONS ///
function selectNote(state, id) {
    if (id < 0) return null
    let notes = resolveNotes(state)
    if (notes.some(n => n.id === id)) {
        Vue.set(state, 'selectedNoteId', id)
    }
}

function selectFirst(state) {
    let notes = resolveNotes(state)
    let id = notes.length ? notes[0].id : -1
    Vue.set(state, 'selectedNoteId', id)
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
        noteById
    },
    mutations: {
        setNotebooks(state, notebookList) {
            Vue.set(state, 'notebooks', notebookList)
        },
        setNotebook(state, { id, password }) {
            Vue.set(state.notebook, 'id', id)
            Vue.set(state.notebook, 'password', password)
        },
        setNotes(state, notes) {
            Vue.set(state.notebook, 'notes', notes)
        },
        addNote(state, note) {
            Vue.set(state.notebook, 'notes', state.notebook.notes.concat([note]))
            if (state.selectedNoteId === note.oldId) selectNote(state, note.id)
        },
        removeNote(state, note) {
            Vue.set(state.notebook, 'notes', state.notebook.notes.filter(n => n.id !== note.id))
            if (state.selectedNoteId === note.id && state.notebook.notes.length) {
                Vue.set(state, 'selectedNoteId', state.notes[0].id)
            }
        },
        updateNote(state, note) {
            let notes = resolveNotes(state)
            let found = notes.find(n => n.id === note.id)
            for (let prop in found) {
                Vue.set(found, prop, note[prop])
            }
        },
        selectNote,
        selectFirst,
        setLoadNotebook(state, id) {
            Vue.set(state, 'loadNotebookId', id)
        },
        addChange(state, { type, payload }) {
            switch (type) {
                case 'add':
                case 'delete':
                    Vue.set(state.changes, type, state.changes[type].concat([payload]))
                    break
                case 'update':
                    let hasChange = state.changes.update.hasOwnProperty(payload.id)
                    let originalNote = (state.notebook.notes || []).find(n => n.id === payload.id)

                    if (originalNote && originalNote.content === payload.content && hasChange) {
                        Vue.delete(state.changes.update, payload.id)
                    } else {
                        Vue.set(state.changes.update, payload.id, payload)
                    }
                    break
            }
        },
        removeChange(state, { type, payload }) {
            switch (type) {
                case 'add':
                case 'delete':
                    let idx = state.changes[type].findIndex(n => n.id === payload.id)
                    Vue.delete(state.changes[type], idx)
                    break
                case 'update':
                    Vue.delete(state.changes.update, payload.id)
            }
        },
        revertChanges(state) {
            Vue.set(state.changes, 'add', [])
            Vue.set(state.changes, 'delete', [])

            Object.keys(state.changes.update).forEach(id => {
                let note = (state.notebook.notes || []).find(n => n.id === parseInt(id))
                let content = note.content

                Vue.set(note, 'content', '')
                Vue.set(note, 'content', content)
            })

            Vue.set(state.changes, 'update', {})
        },
        reset(state) {
            for (let prop in emptyState) {
                Vue.set(state, prop, JSON.parse(JSON.stringify(emptyState[prop])))
            }
        }
    },
    actions: {
        listNotebooks({ commit }) {
            return api.list()
                .then(data => commit('setNotebooks', data))
        },
        loadNotebook({ commit }, { id, password }) {
            return api.getNotes(id, password)
                .then(data => commit('setNotes', data))
                .then(() => commit('setNotebook', { id, password }))
        },
        createNotebook({ commit }, { id, password }) {
            return api.create(id, password)
                .then(data => commit('setNotes', data.notes))
                .then(() => commit('setNotebook', { id, password }))
        },
        updateNotebook({ state, commit }, notebook) {
            let updateNotebook = JSON.parse(JSON.stringify(notebook))
            if (notebook.id === state.notebook.id) delete updateNotebook.id
            return api.update(state.notebook.id, state.notebook.password, updateNotebook)
                .then(() => commit('setNotebook', notebook))
        },
        createNote({ state, commit }, note) {
            return api.addNote(state.notebook.id, state.notebook.password, note)
                .then(data => commit('addNote', { ...note, id: data.id, oldId: note.id }))
        },
        updateNote({ state, commit }, note) {
            return api.updateNote(state.notebook.id, state.notebook.password, note)
                .then(() => commit('updateNote', note))
        },
        deleteNote({ state, commit }, note) {
            return api.deleteNote(state.notebook.id, state.notebook.password, note)
                .then(() => commit('removeNote', note))
        },
        applyChanges({ state, commit, dispatch }) {
            let promises = []

            Object.values(state.changes.update).forEach(n => {
                let newNote = state.changes.add.find(n1 => n1.id === n.id)
                let deletedNote = state.changes.delete.find(n1 => n1.id === n.id)

                if (newNote) {
                    commit('updateNote', n)
                    commit('removeChange', { type: 'update', payload: n })
                }
                else if (deletedNote) commit('removeChange', { type: 'update', payload: n })
                else promises.push(dispatch('updateNote', n).then(() => commit('removeChange', { type: 'update', payload: n })))
            })

            state.changes.add.forEach(n => {
                if (state.changes.delete.some(n1 => n1.id === n.id)) {
                    commit('removeChange', { type: 'add', payload: n })
                    commit('removeChange', { type: 'delete', payload: n })
                }
                else promises.push(dispatch('createNote', n).then(() => commit('removeChange', { type: 'add', payload: n })))
            })
            state.changes.delete.forEach(n => {
                promises.push(dispatch('deleteNote', n).then(() => commit('removeChange', { type: 'delete', payload: n })))
            })

            return Promise.all(promises)
        }
    },
    strict: true
})

export default store