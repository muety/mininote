<template>
  <div id="app">
    <div class="logo">
      <span>✎ Mini_Note</span>
      <span class="small">BETA </span>
    </div>
    <div class="container-fluid">
      <b-alert show v-if="alert && alert.variant === 'danger'" variant="danger">{{ alert.text }}</b-alert>
      <b-alert show v-if="alert && alert.variant === 'success'" variant="success">{{ alert.text }}</b-alert>
      <control-bar @alert="showAlert" :hasChanges="hasChanges"></control-bar>
      <div class="row" v-if="loaded">
        <div class="col-2">
          <notes-picker @noteSelected="onNoteSelected" @alert="showAlert" @addNote="addNote" @deleteNote="deleteNote"></notes-picker>
        </div>
        <div class="col-10" v-if="selectedNoteId >= 0">
          <notes-editor :content="currentContent" :id="selectedNoteId" :dirty="dirty" @alert="showAlert" @contentUpdate="onNoteUpdated"></notes-editor>
        </div>
      </div>
      <div v-if="!loaded && !notebooks.length">
        <div class="placeholder">
          <span>Please create a new notebook.</span>
        </div>
      </div>
      <div v-if="!loaded && notebooks.length">
        <div class="notebooks-picker-container">
          <h3>Your Notebooks</h3>
          <notebooks-picker :notebooks="notebooks" @notebookSelected="onNotebookSelected"></notebooks-picker>
        </div>
      </div>
    </div>
    <div class="footer">Version {{ version }} | 
      Made w/ &#x2661; by
      <a href="https://muetsch.io">Ferdinand Mütsch</a> |
      <a href="https://github.com/muety/mininote">GitHub</a>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

import NotesEditor from './components/NotesEditor'
import NotesPicker from './components/NotesPicker'
import NotebooksPicker from './components/NotebooksPicker'
import ControlBar from './components/ControlBar'

export default {
  name: 'app',
  data() {
    return {
      alert: null
    }
  },
  computed: {
    ...mapState([
      'selectedNoteId',
      'version',
      'notebooks'
    ]),
    ...mapGetters([
      'loaded',
      'selectedNote',
      'dirty',
      'currentContent',
      'noteById'
    ]),
    hasChanges: function() {
      return false
    }
  },
  components: {
    NotesEditor,
    NotesPicker,
    NotebooksPicker,
    ControlBar
  },
  created() {
    window.addEventListener("beforeunload", this.didIntentToLeave)
    this.listNotebooks()
  },
  methods: {
    ...mapActions([
      'listNotebooks'
    ]),
    onNoteSelected: function(noteId) {
      this.$store.commit('selectNote', noteId)
    },
    onNotebookSelected: function(notebookId) {
      this.$store.commit('setLoadNotebook', notebookId)
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
    onNoteUpdated: function({content, id}) {
      this.$store.commit('addChange', { type: 'update', payload: { ...this.noteById(id), content }})
    },
    didIntentToLeave: function(event) {
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
body {
  background-color: #1B2836;
  margin: 20px 0;
}

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
  margin-left: 5px;
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

.btn-primary, #app .btn-primary  {
  background-color: #42B983;
  border-color: #42B983;
}

.btn-primary:hover, #app .btn-primary:hover  {
  background-color: #2b9565;
  border-color: #2b9565;
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

#app .notebooks-picker-container {
  position: absolute;
  width: 500px;
  top: 20vh;
  left: calc(50% - 250px);
}

.alert {
  width: 500px;
  position: fixed;
  top: 15px;
  left: calc(50% - 250px);
  z-index: 999;
  text-align: center;
}

#app h3 {
  font-size: 20px;
  color: #42B983;
}

.no-rounded-right {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.no-rounded-left {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>
