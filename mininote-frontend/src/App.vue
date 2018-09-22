<template>
  <div id="app">
    <div class="logo">
      <span>✎ Mini_Note</span>
      <span class="small">BETA</span>
    </div>
    <div class="container-fluid">
      <b-alert show v-if="alert && alert.variant === 'danger'" variant="danger">{{ alert.text }}</b-alert>
      <b-alert show v-if="alert && alert.variant === 'success'" variant="success">{{ alert.text }}</b-alert>
      <control-bar @alert="showAlert" :hasChanges="hasChanges" :notes="notes" @notesLoaded="onNotesLoaded" @discardChanges="discardChanges"></control-bar>
      <div class="row" v-if="notes">
        <div class="col-2">
          <notes-picker :notes="notes" @noteSelected="onNoteSelected" @alert="showAlert" @addNote="addNote" @deleteNote="deleteNote"></notes-picker>
        </div>
        <div class="col-10" v-if="selectedNote">
          <notes-editor :showEditor="showEditor" :note="selectedNote" @alert="showAlert"></notes-editor>
        </div>
      </div>
      <div v-if="!notes" class="notebook-placeholder">
        <span v-if="notebooks.length === 0" class="placeholder">Please create a notebook.</span>
        <span v-else class="placeholder">Please open an existing notebook or create a new one.</span>
        <div v-if="notebooks.length !== 0" class="notebook-list">
          <notebook-list :notebooks="notebooks"></notebook-list>
        </div>
      </div>
    </div>
    <div class="footer">Made w/ &#x2661; by
      <a href="http://ferdinand-muetsch.de">Ferdinand Mütsch</a> |
      <a href="http://github.com/n1try/mininote">GitHub</a>
    </div>
  </div>
</template>

<script>
import NotebookList from './components/NotebookList'
import NotesEditor from './components/NotesEditor'
import NotesPicker from './components/NotesPicker'
import ControlBar from './components/ControlBar'

import NotesApiService from "./services/NotesApiService";

export default {
  name: 'app',
  data() {
    return {
			showEditor: true,
			notes: null,
      notesInitial: null,
      notebooks: [],
      selectedNoteId: 0,
      alert: null
    }
  },
  computed: {
    selectedNote: function() {
      return this.selectedNoteId > 0 ? this.notes.filter(n => n.id === this.selectedNoteId)[0] : null
    },
    hasChanges: function() {
      if (!this.notes) return false
      if (this.notes.length !== this.notesInitial.length) return true
      let changed = false
      for (let i = 0; i < this.notes.length; i++) {
        if (this.notes[i].title !== this.notesInitial[i].title || this.notes[i].content !== this.notesInitial[i].content) changed = true
      }
      return changed
    }
  },
  components: {
    NotebookList,
    NotesEditor,
    NotesPicker,
    ControlBar
  },
  mounted() {
    this.loadNotebooks()
  },
  methods: {
    loadNotebooks: function() {
      let vm = this;
      NotesApiService.list()
        .then(res => {
          vm.notebooks = res
        })
        .catch(() => {
          // No need to show a message, because the user can still use the app.
        });
    },
    onNoteSelected: function(noteId) {
      this.selectedNoteId = noteId
    },
    onNotesLoaded: function(notes) {
      let isInitialLoad = !this.notesInitial
      this.notes = notes
      this.notesInitial = notes ? JSON.parse(JSON.stringify(notes)) : null
      if (isInitialLoad) this.selectedNoteId = notes ? this.notes.reduce((acc, n) => Math.min(acc, n.id), Number.MAX_VALUE) : 0
    },
    addNote: function(note) {
      this.notes.push(note)
    },
    deleteNote: function(note) {
      this.notes.splice(this.notes.indexOf(note), 1)
    },
    discardChanges: function() {
      this.notes = JSON.parse(JSON.stringify(this.notesInitial))
    },
    showAlert: function(text, variant) {
      let vm = this;
      if (!variant) variant = 'danger'
      vm.alert = { text, variant }
      setTimeout(function() {
        vm.alert = null
      }, 3000)
    }
  }
}
</script>

<style>
body {
  margin: 20px 0 0 !important;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#app a {
  color: #42B983;
  text-decoration: none;
}

#app .logo {
  color: #bbb;
  font-size: 24px;
  position: absolute;
  left: 20px;
}

#app .logo .small {
  color: #42B983;
  font-size: 12px;
}

#app .footer {
  color: #bbb;
  position: fixed;
  bottom: 10px;
  left: 20px;
  font-size: 12px;
}

button {
  cursor: pointer;
}

#app .btn-primary {
  background-color: #42B983;
  border-color: #42B983;
}

#app .notebook-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: calc(100vh - 100px);
  padding: 36px 0;
}

#app .placeholder {
  font-size: 40px;
  text-align: center;
  color: rgb(73, 80, 87);
  width: 33%;
}

#app .notebook-list {
  width: 40%;
  padding: 36px 0;
}

.alert {
  width: 500px;
  position: fixed;
  top: 15px;
  left: calc(50% - 250px);
  z-index: 999;
  text-align: center;
}
</style>
