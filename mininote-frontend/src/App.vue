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
          <notes-editor :note="selectedNote" @alert="showAlert"></notes-editor>
        </div>
      </div>
      <div v-if="!notes">
        <div class="placeholder">
          <span>Please open an existing notebook or create a new one.</span>
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
import NotesEditor from './components/NotesEditor'
import NotesPicker from './components/NotesPicker'
import ControlBar from './components/ControlBar'

export default {
  name: 'app',
  data() {
    return {
      notes: null,
      notesInitial: null,
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
    NotesEditor,
    NotesPicker,
    ControlBar
  },
  created(){
    window.addEventListener("beforeunload", this.didIntentToLeave);
  },
  methods: {
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
    },
    didIntentToLeave: function(event){
      if(this.hasChanges){
        // Cancel the event as stated by the standard.
        event.preventDefault();
        // Chrome requires returnValue to be set.
        event.returnValue = '';
      }
    }
  }
}
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  position: absolute;
  width: 100%;
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

#app .placeholder {
  font-size: 40px;
  text-align: center;
  color: rgb(73, 80, 87);
  position: absolute;
  width: 600px;
  top: 35vh;
  left: calc(50% - 300px);
}

.alert {
  width: 500px;
  position: fixed;
  top: 65px;
  left: calc(50% - 250px);
  z-index: 999;
  text-align: center;
}
</style>
