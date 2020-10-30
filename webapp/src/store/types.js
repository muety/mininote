const state = {
  SELECTED_NOTE_ID: 'selectedNoteId',
  NOTEBOOKS: 'notebooks',
  VERSION: 'version',
}
const getters = {
  LOADED: 'loaded',
  DIRTY: 'dirty',
  NOTES: 'notes',
  SELECTED_NOTE: 'selectedNote',
  NOTE_BY_ID: 'noteById',
  CURRENT_CONTENT: 'currentContent',
  CURRENT_TITLE: 'currentTitle',
}
const actions = {
  LOAD_NOTEBOOK: 'loadNotebook',
  LIST_NOTEBOOKS: 'listNotebooks',
  CREATE_NOTEBOOK: 'createNotebook',
  UPDATE_NOTEBOOK: 'updateNotebook',
  UPDATE_NOTE: 'updateNote',
  APPLY_CHANGES: 'applyChanges',
}
const mutations = {
  SELECT_NOTE: 'selectNote',
  SET_LOAD_NOTEBOOK: 'setLoadNotebook',
  SELECT_FIRST: 'selectFirst',
  ADD_CHANGE: 'addChange',
  REVERT_CHANGES: 'revertChanges',
  RESET: 'reset',
}

export { state, getters, actions, mutations }
