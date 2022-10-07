import { computed, inject, provide, reactive, readonly, unref } from 'vue'
import api from '../api'

import { version } from '../../package.json'

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

export const createStore = () => {
  // >> STATE << //
  const state = reactive({
    ...JSON.parse(JSON.stringify(emptyState)),
  })

  // >> GETTERS << //
  function resolveNotes() {
    let notes = []
    notes = notes.concat(state.notebook.notes || [])
    notes = notes.concat(state.changes.add)
    notes = notes.filter(
      (n1) => !state.changes.delete.some((n2) => n1.id === n2.id),
    )
    return notes
  }

  const selectedNote = computed(() =>
    resolveNotes().find((n) => n.id === state.selectedNoteId),
  )

  const getters = {
    selectedNote,
    noteById: computed(() => (id) => resolveNotes().find((n) => n.id === id)),
    currentContent: computed(() => {
      let id = state.selectedNoteId
      if (id < 0) return ''
      if (id in state.changes.update) return state.changes.update[id].content
      const note = unref(selectedNote)
      return note ? note.content : ''
    }),
    currentTitle: computed(() => {
      let id = state.selectedNoteId
      if (id < 0) return ''
      if (id in state.changes.update) return state.changes.update[id].title
      const note = unref(selectedNote)
      return note ? note.title : ''
    }),
    dirty: computed(
      () =>
        !!(
          state.changes.add.length ||
          state.changes.delete.length ||
          Object.keys(state.changes.update).length
        ),
    ),
    loaded: computed(() => !!state.notebook.notes),
    notes: computed(() => resolveNotes()),
  }

  // >> MUTATIONS << //
  function selectNote(id) {
    if (id < 0) state.selectedNoteId = -1
    let notes = resolveNotes()
    if (notes.some((n) => n.id === id)) {
      state.selectedNoteId = id
    }
  }

  function selectFirst() {
    let notes = resolveNotes()
    let id = notes.length ? notes[0].id : -1
    state.selectedNoteId = id
  }

  function updateUrl() {
    location.hash = state.notebook.id ? `#/notebook/${state.notebook.id}` : ''
  }

  const mutations = {
    updateUrl,
    setNotebooks(notebookList) {
      state.notebooks = notebookList
    },
    setNotebook({ id, password }) {
      state.notebook.id = id
      state.notebook.password = password
      updateUrl(state)
    },
    setNotes(notes) {
      state.notebook.notes = notes
    },
    addNote(note) {
      state.notebook.notes = state.notebook.notes.concat([note])
      if (state.selectedNoteId === note.oldId) selectNote(note.id)
    },
    removeNote(note) {
      state.notebook.notes = state.notebook.notes.filter(
        (n) => n.id !== note.id,
      )
      if (state.selectedNoteId === note.id && state.notebook.notes.length) {
        state.selectedNoteId = state.notes[0].id
      }
    },
    editNote(note) {
      let notes = resolveNotes()
      let found = notes.find((n) => n.id === note.id)
      for (let prop in found) {
        found[prop] = note[prop]
      }
    },
    selectNote,
    selectFirst,
    setLoadNotebook(id) {
      state.loadNotebookId = id
    },
    addChange({ type, payload }) {
      switch (type) {
        case 'add':
        case 'delete':
          state.changes[type] = state.changes[type].concat([payload])
          break
        case 'update':
          // eslint-disable-next-line no-case-declarations
          const hasChange = payload.id in state.changes.update
          // eslint-disable-next-line no-case-declarations
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
    removeChange({ type, payload }) {
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
    revertChanges() {
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

      if (!resolveNotes().length) {
        selectFirst() // select none, i.e. -1
      }
    },
    reset() {
      for (let prop in emptyState) {
        state[prop] = JSON.parse(JSON.stringify(emptyState[prop]))
      }
      updateUrl()
    },
  }

  // >> ACTIONS << //
  const actions = {
    async listNotebooks() {
      mutations.setNotebooks(await api.list())
    },
    async loadNotebook({ id, password }) {
      const data = await api.getNotes(id, password)
      mutations.setNotes(data)
      mutations.setNotebook({ id, password })
    },
    async createNotebook({ id, password }) {
      const data = await api.create(id, password)
      mutations.setNotes(data.notes)
      mutations.setNotebook({ id, password })
    },
    async updateNotebook(notebook) {
      let updateNotebook = JSON.parse(JSON.stringify(notebook))
      if (notebook.id === state.notebook.id) delete updateNotebook.id
      await api.update(
        state.notebook.id,
        state.notebook.password,
        updateNotebook,
      )
      mutations.setNotebook(notebook)
    },
    async deleteNotebook(id) {
      await api.delete(id)
      mutations.setNotebooks(await api.list())
    },
    async createNote(note) {
      const data = await api.addNote(
        state.notebook.id,
        state.notebook.password,
        note,
      )
      mutations.addNote({ ...note, id: data.id, oldId: note.id })
    },
    async updateNote(note) {
      await api.updateNote(state.notebook.id, state.notebook.password, note)
      mutations.editNote(note)
    },
    async deleteNote(note) {
      await api.deleteNote(state.notebook.id, state.notebook.password, note)
      mutations.removeNote(note)
    },
  }

  actions.applyChanges = () => {
    let promises = []

    Object.values(state.changes.update).forEach((n) => {
      let newNote = state.changes.add.find((n1) => n1.id === n.id)
      let deletedNote = state.changes.delete.find((n1) => n1.id === n.id)

      if (newNote) {
        mutations.editNote(n)
        mutations.removeChange({ type: 'update', payload: n })
      } else if (deletedNote) {
        mutations.removeChange({ type: 'update', payload: n })
      } else {
        promises.push(
          actions
            .updateNote(n)
            .then(() => mutations.removeChange({ type: 'update', payload: n })),
        )
      }
    })

    state.changes.add.forEach((n) => {
      if (state.changes.delete.some((n1) => n1.id === n.id)) {
        mutations.removeChange({ type: 'add', payload: n })
        mutations.removeChange({ type: 'delete', payload: n })
      } else {
        promises.push(
          actions
            .createNote(n)
            .then(() => mutations.removeChange({ type: 'add', payload: n })),
        )
      }
    })

    state.changes.delete.forEach((n) => {
      promises.push(
        actions
          .deleteNote(n)
          .then(() => mutations.removeChange({ type: 'delete', payload: n })),
      )
    })

    return Promise.all(promises)
  }

  return {
    state: readonly(state),
    getters,
    mutations,
    actions,
  }
}

export const STORE_KEY = 'store'
export const useStore = () => inject(STORE_KEY)
export const provideStore = () => provide(STORE_KEY, createStore())
