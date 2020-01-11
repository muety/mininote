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
      <div v-if="!loaded">
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
import { mapState, mapGetters } from 'vuex'

import NotesEditor from './components/NotesEditor'
import NotesPicker from './components/NotesPicker'
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
      'selectedNoteId'
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
    ControlBar
  },
  created() {
    window.addEventListener("beforeunload", this.didIntentToLeave);
  },
  methods: {
    onNoteSelected: function(noteId) {
      this.$store.commit('selectNote', noteId)
    },
    onNotesLoaded: function(notes) {
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
  top: 15px;
  left: calc(50% - 250px);
  z-index: 999;
  text-align: center;
}
</style>
