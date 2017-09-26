<template>
  <div id="app">
    <div class="logo">
      <span>✎ Mini_Note</span>
    </div>
    <div class="container-fluid">
      <div class="alert alert-danger" role="alert" v-show="alertText">{{ alertText }}</div>
      <notebook-picker @alert="showAlert" @notesLoaded="onNotesLoaded"></notebook-picker>
      <div class="row" v-if="notes.length">
        <div class="col-2">
          <notes-picker :notes="notes" @noteSelected="onNoteSelected" @alert="showAlert" @addNote="addNote"></notes-picker>
        </div>
        <div class="col-10" v-if="selectedNote !== null">
          <notes-editor :note="selectedNote" @alert="showAlert"></notes-editor>
        </div>
      </div>
      <div v-if="!notes.length">
        <div class="placeholder">
          <span>Please open an existing notebook or create a new one.</span>
        </div>
      </div>
    </div>
    <div class="footer">Made w/ ♡ by <a href="http://ferdinand-muetsch.de">Ferdinand Mütsch</a> | <a href="http://github.com/n1try/mininote">GitHub</a></div>
  </div>
</template>

<script>
import NotesEditor from './components/NotesEditor'
import NotesPicker from './components/NotesPicker'
import NotebookPicker from './components/NotebookPicker'

export default {
  name: 'app',
  data() {
    return {
      data: [],
      selectedNote: null,
      alertText: ''
    }
  },
  computed: {
    notes: function() {
      return this.data
    }
  },
  components: {
    NotesEditor,
    NotesPicker,
    NotebookPicker
  },
  methods: {
    onNoteSelected: function(noteId) {
      this.selectedNote = this.notes.filter(n => n.id === noteId)[0]
    },
    onNotesLoaded: function(notes) {
      this.data = notes
      this.selectedNote = this.data[0]
    },
    addNote: function(note) {
      this.data.push(note)
    },
    showAlert: function(text) {
      let vm = this;
      vm.alertText = text;
      setTimeout(function() {
        vm.alertText = '';
      }, 3000)
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

#app .footer {
  color: #bbb;
  position: fixed;
  bottom: 10px;
  left: 20px;
  font-size: 14px;
}

#app input {
  border: 0;
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
  top: 15px;
  left: calc(50% - 250px);
  z-index: 999;
  text-align: center;
}
</style>
